import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  LinearProgress,
  Box,
  Typography,
  Chip,
  Alert,
} from '@mui/material';
import {
  WifiFind,
  CheckCircle,
  Error,
} from '@mui/icons-material';
import { initializeAPI, apiService } from '../services/api';

const AutoDetector = ({ open, onClose, onBackendDetected }) => {
  const [isDetecting, setIsDetecting] = useState(true);
  const [detectedURL, setDetectedURL] = useState('');
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (open) {
      detectBackend();
    }
  }, [open]);

  const detectBackend = async () => {
    try {
      setIsDetecting(true);
      setError('');
      setProgress(0);

      // Simular progreso
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const baseURL = await initializeAPI();
      
      clearInterval(progressInterval);
      setProgress(100);
      
      // Verificar que el backend responde
      await apiService.getHealth();
      
      setDetectedURL(baseURL);
      setTimeout(() => {
        onBackendDetected(baseURL);
        onClose();
      }, 1000);

    } catch (err) {
      setError('No se pudo encontrar el backend automáticamente');
      console.error('Detección falló:', err);
    } finally {
      setIsDetecting(false);
    }
  };

  const handleRetry = () => {
    setDetectedURL('');
    setError('');
    detectBackend();
  };

  const handleManualClose = () => {
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleManualClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <WifiFind />
          Detectando Backend Automáticamente
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <DialogContentText>
          Estamos buscando automáticamente tu servidor de clasificación...
        </DialogContentText>

        {isDetecting && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress variant="determinate" value={progress} />
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Escaneando red... {progress}%
            </Typography>
          </Box>
        )}

        {detectedURL && (
          <Alert severity="success" sx={{ mt: 2 }}>
            <Box display="flex" alignItems="center" gap={1}>
              <CheckCircle />
              <Typography>
                Backend encontrado en:
              </Typography>
            </Box>
            <Chip 
              label={detectedURL} 
              color="success" 
              variant="outlined"
              sx={{ mt: 1 }}
            />
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            <Box display="flex" alignItems="center" gap={1}>
              <Error />
              <Typography>
                {error}
              </Typography>
            </Box>
            <Button 
              variant="outlined" 
              size="small" 
              onClick={handleRetry}
              sx={{ mt: 1 }}
            >
              Reintentar
            </Button>
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleManualClose}>
          {error ? 'Cerrar' : 'Cancelar'}
        </Button>
        {error && (
          <Button onClick={handleRetry} variant="contained">
            Reintentar
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AutoDetector;