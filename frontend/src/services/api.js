import axios from 'axios';

// Detección automática de IP del backend
const detectBackendIP = async () => {
  const commonIPs = [
    '10.29.180.26',  // Tu IP actual
    '172.30.52.221', // Otra IP que mencionaste
    '192.168.1.100',
    'localhost',
    '127.0.0.1'
  ];

  const currentHost = window.location.hostname;
  if (currentHost && currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
    commonIPs.unshift(currentHost);
  }

  const port = '8000';
  
  for (const ip of commonIPs) {
    const testUrl = `http://${ip}:${port}/health`;
    try {
      console.log(`🔍 Probando: ${testUrl}`);
      const response = await axios.get(testUrl, { timeout: 2000 });
      if (response.status === 200) {
        console.log(`✅ Backend encontrado en: ${ip}:${port}`);
        return `http://${ip}:${port}`;
      }
    } catch (error) {
      console.log(`❌ ${ip} no disponible`);
    }
  }

  console.log('⚠️ Usando localhost como fallback');
  return 'http://localhost:8000';
};

let API_BASE_URL = '';

export const initializeAPI = async () => {
  try {
    API_BASE_URL = await detectBackendIP();
    console.log(`🚀 URL base configurada: ${API_BASE_URL}`);
    return API_BASE_URL;
  } catch (error) {
    console.error('❌ Error inicializando API:', error);
    API_BASE_URL = 'http://localhost:8000';
    return API_BASE_URL;
  }
};

// Crear instancia de axios optimizada
const api = axios.create({
  timeout: 15000, // Timeout más corto para mejor UX
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para logs y manejo de errores
api.interceptors.request.use(
  (config) => {
    config.baseURL = API_BASE_URL;
    console.log(`🔄 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Error en request:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('❌ Error en response:', error.response?.status, error.message);
    return Promise.reject(error);
  }
);

export const apiService = {
  // Obtener URL base actual
  getBaseURL() {
    return API_BASE_URL;
  },

  // Health check rápido
  async getHealth() {
    const response = await api.get('/health');
    return response.data;
  },

  // Clasificar imagen desde la web
  async classifyImage(imageFile) {
    const formData = new FormData();
    formData.append('file', imageFile);
    
    console.log('📤 Enviando imagen para clasificación...');
    
    try {
      const response = await api.post('/api/predict', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // Timeout más largo para procesamiento de imágenes
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error en classifyImage:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },

  // ================= NUEVOS ENDPOINTS PARA CLASIFICACIÓN EN TIEMPO REAL =================
  
  // Obtener estado del stream con predicciones
  async getStreamStatus() {
    const response = await api.get('/api/stream/status');
    return response.data;
  },

  // Obtener predicciones actuales del frame
  async getCurrentPredictions() {
    const response = await api.get('/api/current-predictions');
    return response.data;
  },

  // Enviar frame de prueba
  async sendTestFrame() {
    const response = await api.post('/api/stream/test-frame');
    return response.data;
  },

  // Obtener información del sistema
  async getSystemInfo() {
    const response = await api.get('/api/system-info');
    return response.data;
  },

  // Enviar frame desde ESP32 (para uso directo)
  async sendESP32Frame(imageData) {
    const response = await api.post('/api/esp32/frame', imageData, {
      headers: {
        'Content-Type': 'application/octet-stream',
      },
      timeout: 10000,
    });
    return response.data;
  },

  // URL directa del stream (para usar en img src)
  getStreamURL() {
    return `${API_BASE_URL}/api/camera/stream`;
  },

  // URL de captura única
  getCaptureURL() {
    return `${API_BASE_URL}/capture`;
  },

  // Test de conexión rápida
  async testConnection() {
    try {
      const startTime = Date.now();
      const response = await api.get('/health');
      const responseTime = Date.now() - startTime;
      
      return {
        success: true,
        responseTime,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  // ================= MONITOREO EN TIEMPO REAL =================
  
  // Iniciar monitoreo de predicciones
  startPredictionMonitoring(callback, interval = 2000) {
    const monitor = setInterval(async () => {
      try {
        const predictions = await this.getCurrentPredictions();
        if (predictions && predictions.predictions && predictions.predictions.length > 0) {
          callback(predictions);
        }
      } catch (error) {
        console.log('⚠️ Error en monitoreo:', error.message);
      }
    }, interval);
    
    return monitor;
  },

  // Detener monitoreo
  stopPredictionMonitoring(monitorId) {
    if (monitorId) {
      clearInterval(monitorId);
    }
  }
};

export default api;