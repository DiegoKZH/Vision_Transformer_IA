import React, { useState, useEffect, useRef } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  CircularProgress, 
  Box, 
  Button, 
  Tooltip,
  Alert,
  Chip,
  IconButton,
  Grid,
  LinearProgress
} from '@mui/material';
import { 
  CameraAlt, 
  Refresh, 
  Videocam, 
  VideocamOff,
  Analytics,
  NotificationsActive
} from '@mui/icons-material';
import { apiService } from '../services/api';

const CameraStream = ({ onClassification, disabled, backendURL }) => {
  const [streamError, setStreamError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [streamStatus, setStreamStatus] = useState(null);
  const [isStreamActive, setIsStreamActive] = useState(false);
  const [currentPredictions, setCurrentPredictions] = useState([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const monitoringRef = useRef(null);
  const imgRef = useRef(null);

  const streamUrl = backendURL ? `${backendURL}/api/camera/stream` : '';

  useEffect(() => {
    if (!disabled && backendURL) {
      checkStreamStatus();
      startPredictionMonitoring();
    } else {
      stopPredictionMonitoring();
    }

    return () => {
      stopPredictionMonitoring();
    };
  }, [disabled, backendURL]);

  const checkStreamStatus = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getStreamStatus();
      setStreamStatus(response);
      
      if (response.has_frame) {
        setStreamError(null);
        setIsStreamActive(true);
      } else {
        setStreamError('El stream está activo pero no hay frames disponibles');
        setIsStreamActive(false);
      }
      setIsLoading(false);
    } catch (error) {
      setStreamError('Error conectando al stream');
      setIsStreamActive(false);
      setIsLoading(false);
    }
  };

  const startPredictionMonitoring = () => {
    if (!backendURL || disabled) return;
    
    setIsMonitoring(true);
    monitoringRef.current = apiService.startPredictionMonitoring((data) => {
      setCurrentPredictions(data.predictions);
      
      // Notificar a la app principal sobre nuevas clasificaciones
      if (onClassification && data.predictions.length > 0) {
        const bestPrediction = data.predictions[0]; // Tomar la predicción con mayor confianza
        onClassification(bestPrediction);
      }
    }, 1500); // Monitorear cada 1.5 segundos
  };

  const stopPredictionMonitoring = () => {
    if (monitoringRef.current) {
      apiService.stopPredictionMonitoring(monitoringRef.current);
      monitoringRef.current = null;
    }
    setIsMonitoring(false);
    setCurrentPredictions([]);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setStreamError(null);
    setIsStreamActive(true);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setStreamError('Error cargando el stream de video');
    setIsStreamActive(false);
  };

  const handleCapture = async () => {
    if (!backendURL) return;
    
    try {
      // En una implementación real, aquí capturarías el frame actual del stream
      // Por ahora, usamos las predicciones actuales
      if (currentPredictions.length > 0 && onClassification) {
        const bestPrediction = currentPredictions[0];
        onClassification(bestPrediction);
      } else {
        setStreamError('No hay predicciones disponibles para capturar');
      }
    } catch (error) {
      setStreamError('Error en captura: ' + error.message);
    }
  };

  const refreshStream = () => {
    setStreamError(null);
    setIsLoading(true);
    checkStreamStatus();
    
    // Reiniciar monitoreo
    stopPredictionMonitoring();
    startPredictionMonitoring();
  };

  const toggleMonitoring = () => {
    if (isMonitoring) {
      stopPredictionMonitoring();
    } else {
      startPredictionMonitoring();
    }
  };

  // Función para mapear clases a materiales de tachos
  const mapClassToMaterial = (className) => {
    const classMap = {
      'plastic': 'plastic',
      'glass': 'plastic', 
      'metal': 'plastic',
      'biological': 'organic',
      'food': 'organic',
      'paper': 'paper',
      'cardboard': 'paper'
    };
    
    return classMap[className?.toLowerCase()] || null;
  };

  if (disabled) {
    return (
      <Card sx={{ boxShadow: 4, height: '100%' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <VideocamOff /> Stream en Tiempo Real
          </Typography>
          <Alert severity="warning">
            Stream desactivado: Backend no conectado
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ boxShadow: 4, height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Videocam /> Clasificación en Tiempo Real
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {isMonitoring && (
              <Chip 
                icon={<NotificationsActive />}
                label="MONITOREANDO" 
                color="success"
                size="small"
                variant="outlined"
              />
            )}
            {streamStatus && (
              <Chip 
                label={isStreamActive ? "TRANSMITIENDO" : "SIN SEÑAL"} 
                color={isStreamActive ? "success" : "warning"}
                size="small"
                variant="outlined"
              />
            )}
            <Tooltip title="Actualizar stream">
              <IconButton size="small" onClick={refreshStream} disabled={isLoading}>
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
            <Box sx={{ textAlign: 'center' }}>
              <CircularProgress />
              <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                Conectando con el stream...
              </Typography>
            </Box>
          </Box>
        )}

        {streamError && !isLoading && (
          <Alert 
            severity="error" 
            sx={{ mb: 2 }}
            action={
              <Button color="inherit" size="small" onClick={refreshStream}>
                Reintentar
              </Button>
            }
          >
            {streamError}
          </Alert>
        )}

        {!isLoading && !streamError && streamUrl && (
          <Box sx={{ position: 'relative', textAlign: 'center' }}>
            <Box
              sx={{
                backgroundColor: '#000',
                borderRadius: 2,
                overflow: 'hidden',
                minHeight: 300,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: isStreamActive ? '2px solid #4caf50' : '2px solid #ff9800'
              }}
            >
              <img
                ref={imgRef}
                src={streamUrl}
                alt="ESP32-CAM Stream en vivo con YOLO"
                style={{ 
                  maxWidth: '100%', 
                  height: 'auto', 
                  maxHeight: 400,
                  display: isStreamActive ? 'block' : 'none'
                }}
                onLoad={handleImageLoad}
                onError={handleImageError}
                crossOrigin="anonymous"
              />
              
              {!isStreamActive && (
                <Box sx={{ color: 'white', textAlign: 'center', p: 3 }}>
                  <VideocamOff sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                  <Typography variant="body1" gutterBottom>
                    Stream no disponible
                  </Typography>
                  <Typography variant="body2" color="grey.400">
                    Esperando señal del ESP32-CAM
                  </Typography>
                </Box>
              )}
            </Box>

            {streamStatus && (
              <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="textSecondary">
                  {streamStatus.frame_dimensions || 'Dimensiones no disponibles'}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Clientes: {streamStatus.active_clients}
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Panel de Predicciones en Tiempo Real */}
        {currentPredictions.length > 0 && (
          <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Analytics /> Predicciones Activas
            </Typography>
            
            <Grid container spacing={1}>
              {currentPredictions.slice(0, 3).map((pred, index) => (
                <Grid item xs={12} key={index}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    p: 1,
                    backgroundColor: 'white',
                    borderRadius: 1,
                    border: '1px solid #e0e0e0'
                  }}>
                    <Typography variant="body2" fontWeight="bold">
                      {pred.class}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={pred.confidence * 100} 
                        sx={{ width: 60, height: 6 }}
                        color={
                          pred.confidence > 0.7 ? "success" : 
                          pred.confidence > 0.4 ? "warning" : "error"
                        }
                      />
                      <Typography variant="caption" color="textSecondary">
                        {(pred.confidence * 100).toFixed(1)}%
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Tooltip title="Capturar predicción actual">
            <Button
              variant="outlined"
              color="primary"
              startIcon={<CameraAlt />}
              onClick={handleCapture}
              disabled={!isStreamActive || currentPredictions.length === 0}
            >
              Capturar
            </Button>
          </Tooltip>
          
          <Tooltip title={isMonitoring ? "Detener monitoreo" : "Iniciar monitoreo"}>
            <Button
              variant={isMonitoring ? "contained" : "outlined"}
              color={isMonitoring ? "success" : "secondary"}
              onClick={toggleMonitoring}
              disabled={!isStreamActive}
            >
              {isMonitoring ? "Monitoreando..." : "Monitorear"}
            </Button>
          </Tooltip>
          
          <Tooltip title="Abrir stream en nueva pestaña">
            <Button
              variant="outlined"
              color="info"
              onClick={() => window.open(streamUrl, '_blank')}
              disabled={!streamUrl}
            >
              Abrir Stream
            </Button>
          </Tooltip>
        </Box>

        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            🎯 <strong>Nueva función:</strong> El sistema ahora clasifica automáticamente cada frame del ESP32-CAM.
            Los bounding boxes y predicciones se muestran en el stream en tiempo real.
          </Typography>
        </Alert>

        {currentPredictions.length === 0 && isMonitoring && (
          <Alert severity="warning" sx={{ mt: 1 }}>
            <Typography variant="body2">
              ⚠️ Monitoreando... Esperando detecciones en el stream.
            </Typography>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default CameraStream;