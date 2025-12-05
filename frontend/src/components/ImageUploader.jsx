import React, { useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
} from '@mui/material';
import {
  CloudUpload,
  Image,
} from '@mui/icons-material';

const ImageUploader = ({ onImageUpload, isLoading }) => {
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      onImageUpload(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      onImageUpload(file);
    }
  };

  return (
    <Card sx={{ maxWidth: 600, margin: '0 auto 2rem auto' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom textAlign="center">
          📤 Subir Imagen para Clasificación
        </Typography>

        <Box
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          sx={{
            border: '2px dashed',
            borderColor: 'primary.main',
            borderRadius: 2,
            p: 4,
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: 'grey.50',
            '&:hover': {
              backgroundColor: 'grey.100',
            },
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <Image sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="body1" gutterBottom>
            Arrastra una imagen aquí o haz clic para seleccionar
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Formatos soportados: JPG, PNG, JPEG
          </Typography>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            style={{ display: 'none' }}
          />
        </Box>

        <Button
          variant="contained"
          startIcon={<CloudUpload />}
          onClick={() => fileInputRef.current?.click()}
          fullWidth
          sx={{ mt: 2 }}
          disabled={isLoading}
        >
          {isLoading ? 'Procesando...' : 'Seleccionar Imagen'}
        </Button>

        {isLoading && <LinearProgress sx={{ mt: 2 }} />}
      </CardContent>
    </Card>
  );
};

export default ImageUploader;