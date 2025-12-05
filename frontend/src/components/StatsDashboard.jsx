import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  Stack,
  Alert,
} from '@mui/material';
import {
  BarChart,
  PieChart,
  TrendingUp,
  Analytics,
} from '@mui/icons-material';
import { apiService } from '../services/api';
import { getMaterialInfo } from './MaterialIcons';

const StatsDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [days, setDays] = useState(7);

  useEffect(() => {
    loadStats();
  }, [days]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await apiService.getStats(days);
      setStats(data);
    } catch (err) {
      setError('Error cargando estadísticas');
      console.error('Stats error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="h6">Cargando estadísticas...</Typography>
          <LinearProgress />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography color="error">{error}</Typography>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Alert severity="info">
            No hay datos disponibles para mostrar.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Validar que class_statistics existe y es un array
  const classStatistics = stats.class_statistics || [];
  const totalInPeriod = classStatistics.reduce((sum, item) => sum + (item.count || 0), 0);
  const averageConfidence = classStatistics.length > 0 
    ? (classStatistics.reduce((sum, item) => sum + (item.confidence_avg || 0), 0) / classStatistics.length) * 100
    : 0;

  // Calcular porcentajes para la visualización
  const materialsWithPercentages = classStatistics.map(item => {
    const percentage = totalInPeriod > 0 ? ((item.count || 0) / totalInPeriod) * 100 : 0;
    const materialInfo = getMaterialInfo(item.class);
    return {
      ...item,
      percentage,
      ...materialInfo,
      count: item.count || 0,
      confidence_avg: item.confidence_avg || 0
    };
  });

  // Ordenar por cantidad descendente
  const sortedMaterials = [...materialsWithPercentages].sort((a, b) => b.count - a.count);

  if (classStatistics.length === 0) {
    return (
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" component="h2">
              <Analytics sx={{ mr: 1, verticalAlign: 'middle' }} />
              Dashboard de Estadísticas
            </Typography>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Período</InputLabel>
              <Select
                value={days}
                label="Período"
                onChange={(e) => setDays(e.target.value)}
              >
                <MenuItem value={1}>Último día</MenuItem>
                <MenuItem value={7}>Última semana</MenuItem>
                <MenuItem value={30}>Último mes</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Alert severity="info">
            No hay datos de estadísticas disponibles para el período seleccionado.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ mt: 2 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" component="h2">
            <Analytics sx={{ mr: 1, verticalAlign: 'middle' }} />
            Dashboard de Estadísticas
          </Typography>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Período</InputLabel>
            <Select
              value={days}
              label="Período"
              onChange={(e) => setDays(e.target.value)}
            >
              <MenuItem value={1}>Último día</MenuItem>
              <MenuItem value={7}>Última semana</MenuItem>
              <MenuItem value={30}>Último mes</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Tarjetas de resumen */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
              <TrendingUp sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography color="textSecondary" gutterBottom>
                Total Predicciones
              </Typography>
              <Typography variant="h4" component="div" color="primary.main">
                {stats.total_predictions || 0}
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
              <BarChart sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
              <Typography color="textSecondary" gutterBottom>
                En período seleccionado
              </Typography>
              <Typography variant="h4" component="div" color="secondary.main">
                {totalInPeriod}
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
              <PieChart sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography color="textSecondary" gutterBottom>
                Material Más Común
              </Typography>
              <Typography variant="h6" component="div" color="success.main">
                {sortedMaterials[0]?.name || 'N/A'}
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
              <Analytics sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography color="textSecondary" gutterBottom>
                Confianza Promedio
              </Typography>
              <Typography variant="h6" component="div" color="warning.main">
                {averageConfidence.toFixed(1)}%
              </Typography>
            </Card>
          </Grid>
        </Grid>

        {/* Distribución de materiales */}
        <Card variant="outlined" sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom component="h3">
              Distribución de Materiales
            </Typography>
            <List>
              {sortedMaterials.map((material, index) => (
                <Box key={material.class || index}>
                  <ListItem>
                    <ListItemIcon sx={{ color: material.color }}>
                      {material.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="body1">
                            {material.name}
                          </Typography>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Chip 
                              label={`${material.count} items`} 
                              size="small" 
                              variant="outlined" 
                            />
                            <Chip 
                              label={`${material.percentage.toFixed(1)}%`} 
                              size="small" 
                              color="primary" 
                            />
                          </Stack>
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={material.percentage} 
                            sx={{ 
                              height: 8, 
                              borderRadius: 4,
                              backgroundColor: 'grey.100',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: material.color
                              }
                            }} 
                          />
                          <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                            Confianza: {(material.confidence_avg * 100).toFixed(1)}%
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < sortedMaterials.length - 1 && <Divider variant="inset" component="li" />}
                </Box>
              ))}
            </List>
          </CardContent>
        </Card>

        {/* Detalle por material */}
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {sortedMaterials.map((material) => (
            <Grid item xs={12} sm={6} md={4} key={material.class}>
              <Card variant="outlined">
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <Box sx={{ color: material.color }}>
                      {material.icon}
                    </Box>
                    <Typography variant="h6" component="div">
                      {material.name}
                    </Typography>
                  </Box>
                  
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="textSecondary">
                      Cantidad:
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {material.count}
                    </Typography>
                  </Box>
                  
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="textSecondary">
                      Porcentaje:
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {material.percentage.toFixed(1)}%
                    </Typography>
                  </Box>
                  
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="textSecondary">
                      Confianza:
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {(material.confidence_avg * 100).toFixed(1)}%
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default StatsDashboard;