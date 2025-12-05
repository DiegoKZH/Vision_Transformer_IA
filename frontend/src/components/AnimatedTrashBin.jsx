import React, { useState, useEffect } from 'react';
import { Trash2, Recycle, Box } from 'lucide-react';

const AnimatedTrashBin = ({ type, isOpen, color, icon: Icon, label }) => {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-48 h-64">
        {/* Tapa del tacho */}
        <div
          className={`absolute top-0 left-1/2 -translate-x-1/2 w-44 h-8 rounded-t-xl transition-all duration-700 z-10 ${color}`}
          style={{
            transform: isOpen
              ? 'translateX(-50%) translateY(-30px) rotateX(-45deg)'
              : 'translateX(-50%) translateY(0) rotateX(0deg)',
            transformOrigin: 'bottom center',
          }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-3 bg-gray-700 rounded-full" />
        </div>

        {/* Cuerpo del tacho */}
        <div
          className={`absolute top-8 left-1/2 -translate-x-1/2 w-40 h-48 rounded-b-2xl transition-all duration-500 ${color} ${
            isOpen ? 'shadow-2xl scale-105' : 'shadow-lg'
          }`}
        >
          {/* Icono en el centro */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <Icon
              size={64}
              className={`transition-all duration-500 ${
                isOpen ? 'text-white opacity-100 scale-110' : 'text-white/70 opacity-80'
              }`}
            />
          </div>

          {/* Efecto de brillo cuando está abierto */}
          {isOpen && (
            <div className="absolute inset-0 bg-white/20 rounded-b-2xl animate-pulse" />
          )}

          {/* Líneas decorativas */}
          <div className="absolute bottom-4 left-4 right-4 space-y-2">
            <div className="h-1 bg-white/30 rounded" />
            <div className="h-1 bg-white/30 rounded w-3/4" />
          </div>
        </div>

        {/* Indicador de estado ABIERTO */}
        {isOpen && (
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <div className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-bold animate-bounce shadow-lg">
              🔓 ABIERTO
            </div>
          </div>
        )}
      </div>

      {/* Etiqueta del tipo de basura */}
      <div className="text-center">
        <p className={`text-xl font-bold ${isOpen ? 'scale-110' : ''} transition-transform`}>
          {label}
        </p>
        {isOpen && (
          <p className="text-sm text-green-600 font-semibold mt-1 animate-pulse">
            ✓ Material detectado
          </p>
        )}
      </div>
    </div>
  );
};

export default function SmartTrashBins() {
  const [openBins, setOpenBins] = useState({
    plastic: false,
    organic: false,
    paper: false,
  });

  const [lastDetection, setLastDetection] = useState(null);

  const bins = [
    {
      id: 'plastic',
      label: 'PLÁSTICO',
      color: 'bg-blue-500',
      icon: Recycle,
      materials: ['plastic', 'glass', 'metal'],
    },
    {
      id: 'organic',
      label: 'ORGÁNICO',
      color: 'bg-green-600',
      icon: Trash2,
      materials: ['biological', 'food'],
    },
    {
      id: 'paper',
      label: 'PAPEL/CARTÓN',
      color: 'bg-amber-600',
      icon: Box,
      materials: ['paper', 'cardboard'],
    },
  ];

  // Simular detección de materiales cada 5 segundos
  useEffect(() => {
    const materials = ['plastic', 'biological', 'paper', 'cardboard', 'glass', 'metal'];
    
    const interval = setInterval(() => {
      const randomMaterial = materials[Math.floor(Math.random() * materials.length)];
      handleMaterialDetection(randomMaterial);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleMaterialDetection = (material) => {
    // Encontrar qué tacho debe abrirse
    const binToOpen = bins.find((bin) => bin.materials.includes(material));
    
    if (binToOpen) {
      setLastDetection({ type: material, bin: binToOpen.label });
      
      // Abrir el tacho
      setOpenBins((prev) => ({ ...prev, [binToOpen.id]: true }));

      // Cerrar el tacho después de 3 segundos
      setTimeout(() => {
        setOpenBins((prev) => ({ ...prev, [binToOpen.id]: false }));
      }, 3000);
    }
  };

  // Función para probar manualmente cada tacho
  const testBin = (binId) => {
    setOpenBins((prev) => ({ ...prev, [binId]: true }));
    setTimeout(() => {
      setOpenBins((prev) => ({ ...prev, [binId]: false }));
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            🤖 Sistema de Clasificación Inteligente
          </h1>
          <p className="text-xl text-gray-600">
            Los tachos se abren automáticamente al detectar el material correspondiente
          </p>
        </div>

        {/* Última detección */}
        {lastDetection && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-4">
              <span className="text-3xl">🎯</span>
              <div>
                <p className="text-lg font-semibold text-gray-800">
                  Última detección: <span className="text-green-600">{lastDetection.type}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Depositando en: {lastDetection.bin}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tachos de basura */}
        <div className="flex flex-wrap justify-center gap-12 mb-12">
          {bins.map((bin) => (
            <AnimatedTrashBin
              key={bin.id}
              type={bin.id}
              isOpen={openBins[bin.id]}
              color={bin.color}
              icon={bin.icon}
              label={bin.label}
            />
          ))}
        </div>

        {/* Botones de prueba */}
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
            🧪 Probar Detección Manual
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            {bins.map((bin) => (
              <button
                key={bin.id}
                onClick={() => testBin(bin.id)}
                className={`${bin.color} text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity shadow-md`}
              >
                Abrir {bin.label}
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-500 text-center mt-4">
            💡 Los tachos también se abren automáticamente cada 5 segundos
          </p>
        </div>

        {/* Información */}
        <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-4 max-w-2xl mx-auto rounded">
          <p className="text-sm text-blue-800">
            <strong>ℹ️ Cómo funciona:</strong> Cuando se detecta un material (plástico, papel, orgánico),
            el tacho correspondiente se abre automáticamente durante 3 segundos y luego se cierra.
          </p>
        </div>
      </div>
    </div>
  );
}