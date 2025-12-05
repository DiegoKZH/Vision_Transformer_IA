import { useEffect, useState, useMemo } from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  Modal,
  Fade,
  Backdrop,
  Button,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Chip
} from "@mui/material";
import SettingsIcon from '@mui/icons-material/Settings'; // Assuming this might be available or I'll use text if not
import CameraAltIcon from '@mui/icons-material/CameraAlt';

// --- CONSTANTS ---
const WASTE_CLASSES = [
  'plastic', 'glass', 'metal', 'paper', 'cardboard', 'biological'
];

const BIN_COLORS = [
  'var(--bin-1-color)',
  'var(--bin-2-color)',
  'var(--bin-3-color)'
];

const DEFAULT_MAPPING = {
  'plastic': 0,
  'metal': 0,
  'glass': 1,
  'biological': 1,
  'paper': 2,
  'cardboard': 2
};

// --- COMPONENTS ---

const Bin = ({ id, label, color, isOpen, assignedClasses }) => {
  return (
    <div className={`bin-container ${isOpen ? 'bin-open' : ''}`} style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      minHeight: '280px',
      justifyContent: 'flex-end',
      position: 'relative'
    }}>
      {/* LID */}
      <div className="lid" style={{
        width: '140px',
        height: '20px',
        backgroundColor: color,
        borderRadius: '10px 10px 0 0',
        marginBottom: '2px',
        boxShadow: `0 0 20px ${isOpen ? color : 'transparent'}`,
        zIndex: 2,
        position: 'relative'
      }}>
        <div style={{
          width: '30px', height: '6px', background: 'rgba(0,0,0,0.2)', margin: '6px auto', borderRadius: '4px'
        }} />
      </div>

      {/* BODY */}
      <div className="glass" style={{
        width: '120px',
        height: '180px',
        borderTop: `4px solid ${color}`,
        borderBottomLeftRadius: '16px',
        borderBottomRightRadius: '16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        background: `linear-gradient(180deg, rgba(255,255,255,0.02) 0%, ${color}20 100%)`
      }}>
        {/* INDICATOR LIGHT */}
        <div style={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          backgroundColor: isOpen ? color : '#334155',
          boxShadow: isOpen ? `0 0 15px ${color}, 0 0 30px ${color}` : 'none',
          marginBottom: '20px',
          transition: 'all 0.3s ease'
        }} />

        <Typography variant="h3" fontWeight="800" sx={{ color: 'rgba(255,255,255,0.1)' }}>
          {id + 1}
        </Typography>
      </div>

      {/* LABEL & CONTENTS */}
      <Box mt={2} textAlign="center">
        <Typography variant="h6" fontWeight="bold" sx={{ color: color }}>
          {label}
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'center', maxWidth: '150px', mt: 1 }}>
          {assignedClasses.map(cls => (
            <span key={cls} style={{
              fontSize: '0.65rem',
              padding: '2px 6px',
              borderRadius: '4px',
              background: 'rgba(255,255,255,0.1)',
              color: '#94a3b8',
              textTransform: 'uppercase'
            }}>
              {cls}
            </span>
          ))}
        </Box>
      </Box>
    </div>
  );
};

function App() {
  const [frame, setFrame] = useState(null);
  const [detections, setDetections] = useState([]);
  const [mapping, setMapping] = useState(DEFAULT_MAPPING);
  const [openBinIndex, setOpenBinIndex] = useState(null);

  // Configuration Modal State
  const [configOpen, setConfigOpen] = useState(false);

  // Buffer to holding last open bin to prevent flickering
  const [lastOpenTime, setLastOpenTime] = useState(0);

  useEffect(() => {
    const ws = new WebSocket("ws://192.168.77.26:8150/ws/frontend");

    ws.onopen = () => console.log("🖥️ WebSocket conectado al backend");
    ws.onerror = () => console.log("⚠️ Error en WebSocket");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "update") {
        setFrame("data:image/jpeg;base64," + data.frame);
        setDetections(data.detections);
      }
    };

    return () => ws.close();
  }, []);

  // Logic to determine which bin to open based on detections
  useEffect(() => {
    if (detections.length > 0) {
      // Find highest confidence detection
      const bestDetection = detections.reduce((prev, current) =>
        (prev.confidence > current.confidence) ? prev : current
      );

      // If confidence > 0.5 (safe threshold)
      if (bestDetection.confidence > 0.5) {
        const binIndex = mapping[bestDetection.class];
        if (binIndex !== undefined) {
          setOpenBinIndex(binIndex);
          setLastOpenTime(Date.now());
        }
      }
    } else {
      // Close bin after 1 second of no detections
      if (Date.now() - lastOpenTime > 1000) {
        setOpenBinIndex(null);
      }
    }

    // Cleanup timeout logic
    const interval = setInterval(() => {
      if (detections.length === 0 && (Date.now() - lastOpenTime > 1000)) {
        setOpenBinIndex(null);
      }
    }, 500);

    return () => clearInterval(interval);

  }, [detections, mapping, lastOpenTime]);


  const handleMappingChange = (wasteClass, binIndex) => {
    setMapping(prev => ({
      ...prev,
      [wasteClass]: binIndex
    }));
  };

  return (
    <Box sx={{ minHeight: '100vh', padding: { xs: 2, md: 4 } }}>

      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={6}>
        <Box>
          <Typography variant="h4" fontWeight="800" className="text-gradient">
            EcoSort AI
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Sistema Inteligente de Clasificación
          </Typography>
        </Box>
        <Button
          onClick={() => setConfigOpen(true)}
          variant="outlined"
          sx={{
            borderColor: 'rgba(255,255,255,0.2)',
            color: 'white',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            textTransform: 'none'
          }}
        >
          Configuración
        </Button>
      </Box>

      <Grid container spacing={4}>

        {/* LEFT COLUMN: VIDEO */}
        <Grid item xs={12} lg={5}>
          <div className="glass" style={{ padding: '20px', borderRadius: '24px', height: '100%' }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <div className="animate-pulse-ring" style={{ width: '10px', height: '10px', background: '#ef4444', borderRadius: '50%' }} />
              <Typography fontWeight="600" color="error" variant="caption">EN VIVO</Typography>
            </Box>

            <div style={{
              borderRadius: '16px',
              overflow: 'hidden',
              backgroundColor: '#000',
              aspectRatio: '4/3',
              position: 'relative'
            }}>
              {frame ? (
                <img src={frame} alt="Video Stream" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%" color="text.secondary">
                  <CameraAltIcon sx={{ fontSize: 40, opacity: 0.5, mb: 1 }} />
                  <Typography variant="body2">Esperando señal de cámara...</Typography>
                </Box>
              )}

              {/* Overlay Detections on Video */}
              {detections.map((d, i) => (
                <Box key={i} sx={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  background: 'rgba(253, 0, 0, 0.6)',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  backdropFilter: 'blur(4px)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <Typography variant="caption" color="white">
                    {d.class} <span style={{ color: '#4ade80' }}>{(d.confidence * 100).toFixed(0)}%</span>
                  </Typography>
                </Box>
              ))}
            </div>

            <Typography variant="body2" color="text.secondary" mt={2} textAlign="center">
              Modelo: YOLOv8 Nano • Latencia: ~50ms
            </Typography>
          </div>
        </Grid>

        {/* RIGHT COLUMN: BINS */}
        <Grid item xs={12} lg={7}>
          <Grid container spacing={2} justifyContent="center" alignItems="center" height="100%">
            {[0, 1, 2].map(id => {
              const assigned = Object.entries(mapping)
                .filter(([cls, binId]) => binId === id)
                .map(([cls]) => cls);

              return (
                <Grid item xs={12} sm={4} key={id}>
                  <Bin
                    id={id}
                    label={`TACHO ${id + 1}`}
                    color={BIN_COLORS[id]}
                    isOpen={openBinIndex === id}
                    assignedClasses={assigned}
                  />
                </Grid>
              )
            })}
          </Grid>
        </Grid>
      </Grid>


      {/* CONFIG MODAL */}
      <Modal
        open={configOpen}
        onClose={() => setConfigOpen(false)}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{ timeout: 500, sx: { backdropFilter: 'blur(5px)' } }}
      >
        <Fade in={configOpen}>
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: 500 },
            bgcolor: '#1e293b',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: 24,
            p: 4,
            borderRadius: 4,
            outline: 'none'
          }}>
            <Typography variant="h5" component="h2" fontWeight="800" mb={3}>
              Configuración de Clasificación
            </Typography>

            <Grid container spacing={2}>
              {WASTE_CLASSES.map((cls) => (
                <Grid item xs={12} key={cls} display="flex" alignItems="center" justifyContent="space-between">
                  <Typography sx={{ textTransform: 'capitalize' }}>{cls}</Typography>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[0, 1, 2].map(binId => (
                      <div
                        key={binId}
                        onClick={() => handleMappingChange(cls, binId)}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: mapping[cls] === binId ? BIN_COLORS[binId] : 'rgba(255,255,255,0.1)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          color: mapping[cls] === binId ? 'rgba(0,0,0,0.7)' : '#64748b',
                          transition: 'all 0.2s',
                          border: mapping[cls] === binId ? 'none' : '1px solid rgba(255,255,255,0.1)'
                        }}
                      >
                        {binId + 1}
                      </div>
                    ))}
                  </div>
                </Grid>
              ))}
            </Grid>

            <Box mt={4} display="flex" justifyContent="flex-end">
              <Button
                variant="contained"
                onClick={() => setConfigOpen(false)}
                sx={{ borderRadius: '10px', background: 'white', color: 'black', fontWeight: 'bold' }}
              >
                Guardar
              </Button>
            </Box>
          </Box>
        </Fade>
      </Modal>

    </Box>
  );
}

export default App;
