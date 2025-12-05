// components/ClassificationResults.jsx
import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress,
  Grid,
} from '@mui/material';

const ClassificationResults = ({ results, isLoading, selectedImage }) => {
  if (isLoading) {
    return (
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Procesando imagen...
          </Typography>
          <LinearProgress />
        </CardContent>
      </Card>
    );
  }

  if (!results) {
    return null;
  }

  return (
    <Card sx={{ mt: 2 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          📋 Resultados de Clasificación
        </Typography>
        
        <Grid container spacing={3}>
          {/* Imagen */}
          {selectedImage && (
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Imagen Analizada
              </Typography>
              <Box
                component="img"
                src={selectedImage}
                alt="Imagen analizada"
                sx={{
                  width: '100%',
                  maxWidth: 400,
                  borderRadius: 2,
                  boxShadow: 3,
                }}
              />
            </Grid>
          )}
          
          {/* Resultados */}
          <Grid item xs={12} md={selectedImage ? 6 : 12}>
            <Typography variant="h6" gutterBottom>
              Detecciones
            </Typography>
            
            {results.predictions && results.predictions.length > 0 ? (
              results.predictions.map((prediction, index) => (
                <Box key={index} sx={{ mb: 2, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="h6">
                      {prediction.class}
                    </Typography>
                    <Chip 
                      label={`${(prediction.confidence * 100).toFixed(1)}%`}
                      color="primary"
                      variant="filled"
                    />
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={prediction.confidence * 100}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
              ))
            ) : (
              <Typography color="textSecondary">
                No se detectaron objetos en la imagen.
              </Typography>
            )}
            
            {/* Métricas */}
            {results.metrics && (
              <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="h6" gutterBottom>
                  Métricas
                </Typography>
                <Typography variant="body2">
                  Tiempo de procesamiento: {results.metrics.processing_time}s
                </Typography>
                <Typography variant="body2">
                  Total de detecciones: {results.metrics.detections_count}
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default ClassificationResults;