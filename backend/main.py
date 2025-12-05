from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import cv2
import numpy as np
import base64
import asyncio
import logging
from ultralytics import YOLO
import os
import uvicorn

# Configuración
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("server")

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_headers=["*"],
    allow_credentials=True,
    allow_methods=["*"],
)

# Modelo YOLO
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "IA", "best.pt")
model = YOLO(MODEL_PATH)
logger.info("✅ Modelo YOLO cargado")

# Variables globales
current_frame = None
current_predictions = []
frontend_clients = set()

# ============================================================
# WEBSOCKET ESP32-CAM OPTIMIZADO
# ============================================================
@app.websocket("/ws/camera")
async def ws_camera(websocket: WebSocket):
    global current_frame, current_predictions

    await websocket.accept()
    logger.info("📡 ESP32-CAM conectado")

    # Configuración para reducir latencia
    frame_counter = 0
    PROCESS_EVERY_N_FRAMES = 2  # Procesar solo cada 2 frames
    last_detections = []

    try:
        while True:
            # Recibir frame del ESP32
            img_bytes = await websocket.receive_bytes()
            np_arr = np.frombuffer(img_bytes, np.uint8)
            frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

            if frame is None:
                continue

            frame_counter += 1
            
            # Siempre guardar el frame actual para mostrar
            display_frame = frame.copy()
            
            # ==========================================
            # ESTRATEGIA: PROCESAR SOLO CADA N FRAMES
            # ==========================================
            should_process = (frame_counter % PROCESS_EVERY_N_FRAMES == 0)
            
            if should_process:
                # Procesar con YOLO (configuración rápida)
                results = model(frame, 
                              conf=0.5,
                              imgsz=320,  # Tamaño más pequeño para más velocidad
                              verbose=False)

                dets = []
                for r in results:
                    for box in r.boxes:
                        x1, y1, x2, y2 = box.xyxy[0].cpu().numpy().astype(int)
                        conf = float(box.conf[0])
                        cls = int(box.cls[0])
                        label = model.names[cls]

                        dets.append({
                            "class": label,
                            "confidence": round(conf, 2),
                        })

                        # Dibujar en el frame de display
                        cv2.rectangle(display_frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                        cv2.putText(display_frame, f"{label} {conf:.2f}",
                                    (x1, y1 - 5),
                                    cv2.FONT_HERSHEY_SIMPLEX,
                                    0.6, (0, 255, 0), 2)
                
                current_predictions = dets
                last_detections = dets
            else:
                # Reutilizar las últimas detecciones
                current_predictions = last_detections
                # Dibujar detecciones anteriores
                for det in last_detections:
                    # Nota: En este caso no dibujamos porque no tenemos las coordenadas
                    # Pero mantenemos la información para el frontend
                    pass

            current_frame = display_frame

            # Enviar inmediatamente al frontend
            await send_to_frontend()

    except WebSocketDisconnect:
        logger.warning("❌ ESP32 desconectado.")
    except Exception as e:
        logger.error(f"❌ Error: {e}")

# ============================================================
# WEBSOCKET FRONTEND (SIN CAMBIOS)
# ============================================================
@app.websocket("/ws/frontend")
async def frontend_socket(websocket: WebSocket):
    await websocket.accept()
    frontend_clients.add(websocket)
    logger.info("🖥️ Frontend conectado.")

    try:
        while True:
            await asyncio.sleep(1)
    except WebSocketDisconnect:
        logger.info("🔌 Frontend desconectado.")
        frontend_clients.remove(websocket)

# ============================================================
# ENVÍO OPTIMIZADO AL FRONTEND
# ============================================================
async def send_to_frontend():
    if not frontend_clients or current_frame is None:
        return

    # Comprimir JPEG con configuración para baja latencia
    encode_params = [cv2.IMWRITE_JPEG_QUALITY, 85]  # Calidad balanceada
    _, jpeg = cv2.imencode(".jpg", current_frame, encode_params)
    jpeg_b64 = base64.b64encode(jpeg.tobytes()).decode()

    data = {
        "type": "update",
        "frame": jpeg_b64,
        "detections": current_predictions
    }

    # Enviar de forma asíncrona
    for client in list(frontend_clients):
        try:
            await client.send_json(data)
        except:
            frontend_clients.remove(client)

@app.get("/")
def home():
    return {"status": "ok", "optimized": True}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8150, reload=False)