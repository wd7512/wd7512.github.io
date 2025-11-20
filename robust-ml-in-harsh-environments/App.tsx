import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Stars, Float } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ShieldAlert, Cpu, Activity, BarChart3, Zap } from 'lucide-react';
import { SectionId } from './types';
import { BitFlipVisualizer } from './components/BitFlipVisualizer';
import { ActivationPlayground } from './components/ActivationPlayground';
import { ResultsDashboard } from './components/ResultsDashboard';

// --- 3D Background Components ---

const ParticleField = () => {
  const count = 800;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const [dummy] = useState(() => new THREE.Object3D());
  
  const particles = useRef<Array<{ t: number, factor: number, speed: number, xFactor: number, yFactor: number, zFactor: number }>>([]);

  useEffect(() => {
    particles.current = new Array(count).fill(0).map(() => ({
      t: Math.random() * 100,
      factor: 20 + Math.random() * 100,
      speed: 0.01 + Math.random() * 0.03,
      xFactor: -50 + Math.random() * 100,
      yFactor: -50 + Math.random() * 100,
      zFactor: -50 + Math.random() * 100,
    }));
  }, []);

  useFrame((state) => {
    if (!mesh.current) return;
    
    particles.current.forEach((particle, i) => {
      let { t, factor, speed, xFactor, yFactor, zFactor } = particle;
      t = particle.t += speed / 2;
      const a = Math.cos(t) + Math.sin(t * 1) / 10;
      const b = Math.sin(t) + Math.cos(t * 2) / 10;
      const s = Math.cos(t);
      
      dummy.position.set(
        (particle.xFactor + Math.cos(t / 10) * factor) + (Math.sin(t * 1) * factor) / 10,
        (particle.yFactor + Math.sin(t / 10) * factor) + (Math.cos(t * 2) * factor) / 10,
        (particle.zFactor + Math.cos(t / 10) * factor) + (Math.sin(t * 3) * factor) / 10
      );
      dummy.scale.set(s, s, s);
      dummy.rotation.set(s * 5, s * 5, s * 5);
      dummy.updateMatrix();
      
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <dodecahedronGeometry args={[0.2, 0]} />
      <meshPhongMaterial color="#3b82f6" emissive="#1d4ed8" transparent opacity={0.8} />
    </instancedMesh>
  );
};

const Scene = () => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <ParticleField />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <fog attach="fog" args={['#f8fafc', 30, 120]} /> 
    </>
  );
};

// --- Main App Components ---

interface SectionProps {
  id: SectionId;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  isActive: boolean;
}

const Section: React.FC<SectionProps> = ({ 
  id, 
  title, 
  subtitle, 
  children, 
  isActive 
}) => {
  if (!isActive) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-5xl mx-auto px-6 py-12 mb-24 bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-slate-100"
    >
      <div className="mb-8 border-b border-slate-100 pb-6">
        <div className="flex items-center space-x-3 mb-2">
          <div className="h-8 w-1 bg-blue-600 rounded-full"></div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{title}</h2>
        </div>
        {subtitle && <p className="text-lg text-slate-600 ml-4">{subtitle}</p>}
      </div>
      <div className="space-y-6 text-slate-700 leading-relaxed">
        {children}
      </div>
    </motion.div>
  );
};

const Navigation = ({ currentSection, setSection }: { currentSection: SectionId, setSection: (s: SectionId) => void }) => {
  const navItems = [
    { id: SectionId.INTRO, icon: ShieldAlert, label: 'Overview' },
    { id: SectionId.MECHANISM, icon: Cpu, label: 'The Threat' },
    { id: SectionId.SOLUTION, icon: Activity, label: 'The Solution' },
    { id: SectionId.RESULTS, icon: BarChart3, label: 'Results' },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-white/90 backdrop-blur-lg px-2 py-2 rounded-full shadow-2xl border border-slate-200 flex space-x-1">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setSection(item.id)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 ${
            currentSection === item.id 
              ? 'bg-blue-600 text-white shadow-lg scale-105' 
              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <item.icon size={18} />
          <span className={`text-sm font-medium ${currentSection === item.id ? 'block' : 'hidden md:block'}`}>
            {item.label}
          </span>
        </button>
      ))}
    </div>
  );
};

export default function App() {
  const [currentSection, setCurrentSection] = useState<SectionId>(SectionId.INTRO);

  return (
    <div className="relative w-full min-h-screen overflow-x-hidden bg-slate-50 selection:bg-blue-100 selection:text-blue-900">
      
      {/* 3D Background Layer */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 30], fov: 45 }}>
          <Suspense fallback={null}>
            <Scene />
            <OrbitControls 
              enableZoom={false} 
              autoRotate 
              autoRotateSpeed={0.5} 
              enablePan={false} 
              maxPolarAngle={Math.PI / 2} 
              minPolarAngle={Math.PI / 3} 
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Content Layer */}
      <div className="relative z-10 min-h-screen flex flex-col">
        
        {/* Header */}
        <header className="w-full p-6 flex justify-between items-center bg-gradient-to-b from-white/80 to-transparent">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-600 text-white p-2 rounded-lg">
              <Zap size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">RobustNet</h1>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Research Visualization</p>
            </div>
          </div>
          <a href="https://doi.org/10.5220/0013155000003890" target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline font-medium">
            View Paper Source
          </a>
        </header>

        <main className="flex-grow flex flex-col items-center pt-10 pb-32 px-4">
          
          <AnimatePresence mode="wait">
            
            {currentSection === SectionId.INTRO && (
              <Section 
                key="intro" 
                id={SectionId.INTRO} 
                isActive={true} 
                title="AI in the Danger Zone"
                subtitle="A Review of CNN Design Choices for Harsh Environments"
              >
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div>
                    <p className="text-xl text-slate-800 font-light leading-relaxed mb-6">
                      Machine Learning models are venturing into extreme frontiers: space exploration, nuclear facilities, and high-altitude aviation.
                    </p>
                    <p className="mb-4">
                      In these environments, electronics are bombarded by radiation. High-energy particles can strike a transistor and flip a bit in memory—a phenomenon known as a <span className="font-bold text-blue-600">Single Event Effect (SEE)</span>.
                    </p>
                    <p>
                      This research explores how these microscopic errors can catastrophically break standard Convolutional Neural Networks (CNNs) and proposes a novel framework to build robust models using <strong>Rectified Weighted Gaussian (RWG)</strong> activation functions.
                    </p>
                  </div>
                  <div className="relative bg-blue-50 rounded-2xl p-8 border border-blue-100">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 bg-white p-4 rounded-xl shadow-lg border border-slate-100">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-bold text-slate-500">STATUS: VULNERABLE</span>
                      </div>
                    </div>
                    <h3 className="font-bold text-slate-900 mb-4">The Problem: "Black Box" Fragility</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <ShieldAlert className="w-5 h-5 text-red-500 mr-2 mt-1 flex-shrink-0" />
                        <span className="text-sm"><strong>Bitflips</strong> in weights create extreme values.</span>
                      </li>
                      <li className="flex items-start">
                        <ShieldAlert className="w-5 h-5 text-red-500 mr-2 mt-1 flex-shrink-0" />
                        <span className="text-sm"><strong>ReLU</strong> propagates these errors to infinity.</span>
                      </li>
                      <li className="flex items-start">
                        <ShieldAlert className="w-5 h-5 text-red-500 mr-2 mt-1 flex-shrink-0" />
                        <span className="text-sm">Standard <strong>Max Pooling</strong> preserves the error.</span>
                      </li>
                    </ul>
                    <button 
                      onClick={() => setCurrentSection(SectionId.MECHANISM)}
                      className="mt-8 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors flex items-center justify-center space-x-2"
                    >
                      <span>Investigate the Threat</span>
                      <ChevronDown size={16} />
                    </button>
                  </div>
                </div>
              </Section>
            )}

            {currentSection === SectionId.MECHANISM && (
              <Section 
                key="mechanism" 
                id={SectionId.MECHANISM} 
                isActive={true} 
                title="Anatomy of a Bitflip"
                subtitle="Why a single sub-atomic particle can ruin an AI model."
              >
                <div className="space-y-8">
                  <div>
                    <p className="mb-6">
                      Computers represent numbers using the <strong>IEEE 754 Floating Point</strong> standard. A 32-bit float consists of a Sign bit, 8 Exponent bits, and 23 Mantissa bits.
                    </p>
                    <div className="p-4 bg-amber-50 border-l-4 border-amber-400 text-amber-900 rounded-r-lg mb-6 text-sm">
                      <strong>Key Insight:</strong> Not all bits are equal. Flipping a bit in the <em>Exponent</em> can change a small weight (e.g., 0.5) into a massive number (e.g., 10<sup>38</sup>), destroying the network's calculations.
                    </div>
                  </div>
                  
                  <div className="bg-slate-100 rounded-2xl p-6 shadow-inner">
                    <h3 className="text-center font-bold text-slate-700 mb-4">Interactive Bitflip Simulator</h3>
                    <BitFlipVisualizer />
                  </div>

                  <div className="grid md:grid-cols-3 gap-6 text-sm">
                     <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                       <h4 className="font-bold text-slate-900 mb-2">Sign Bit (1 bit)</h4>
                       <p className="text-slate-500">Changes positive to negative. Usually manageable impact.</p>
                     </div>
                     <div className="bg-white p-4 rounded-xl border border-red-200 shadow-sm ring-1 ring-red-100">
                       <h4 className="font-bold text-red-900 mb-2">Exponent (8 bits)</h4>
                       <p className="text-slate-500">Scales the number by powers of 2. <strong>Most dangerous</strong> location for errors.</p>
                     </div>
                     <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                       <h4 className="font-bold text-slate-900 mb-2">Mantissa (23 bits)</h4>
                       <p className="text-slate-500">Controls precision. Errors here are usually small noise.</p>
                     </div>
                  </div>
                </div>
              </Section>
            )}

            {currentSection === SectionId.SOLUTION && (
              <Section 
                key="solution" 
                id={SectionId.SOLUTION} 
                isActive={true} 
                title="The Proposed Framework"
                subtitle="Robust Design Choices: RWG Activation & Smart Pooling"
              >
                <div className="space-y-8">
                  <p>
                    Standard activation functions like <strong>ReLU</strong> (Rectified Linear Unit) are unbounded. If an error creates a huge value, ReLU passes it forward. The paper proposes <strong>Rectified Weighted Gaussian (RWG)</strong>, which naturally suppresses extreme values.
                  </p>

                  <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                      <h3 className="font-semibold text-slate-800">Activation Function Response</h3>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Interactive Graph</span>
                    </div>
                    <div className="p-6">
                      <ActivationPlayground />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-3">1. RWG Activation</h3>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        Defined as <code className="bg-slate-100 px-1 rounded">max(0, x * exp(-x²))</code>. 
                        For normal inputs (around 0), it behaves similarly to ReLU, allowing learning. 
                        For extreme inputs (caused by SEEs), it decays to zero, effectively "turning off" the corrupted neuron.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-3">2. Smart Pooling</h3>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        Instead of standard Max Pooling (which always picks the largest value, potentially picking the error), 
                        Smart Pooling ignores values above a statistical threshold (outliers), preventing the error from moving to the next layer.
                      </p>
                    </div>
                  </div>
                </div>
              </Section>
            )}

            {currentSection === SectionId.RESULTS && (
              <Section 
                key="results" 
                id={SectionId.RESULTS} 
                isActive={true} 
                title="Experimental Results"
                subtitle="Comparing standard architectures against the robust framework"
              >
                <div className="space-y-12">
                   <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                     <h3 className="text-lg font-bold text-slate-800 mb-6 text-center">Error Impact (Test Delta)</h3>
                     <p className="text-center text-sm text-slate-500 mb-8 max-w-2xl mx-auto">
                       Lower is better. The "Test Delta" represents the drop in accuracy after a fault is injected. 
                       Notice how RWG significantly outperforms ReLU, especially when combined with Dropout.
                     </p>
                     <ResultsDashboard />
                   </div>

                   <div className="grid md:grid-cols-3 gap-6">
                      <div className="p-6 bg-green-50 rounded-xl border border-green-100 text-center">
                        <div className="text-3xl font-bold text-green-600 mb-2">-40%</div>
                        <div className="text-sm font-medium text-green-900">Error Reduction</div>
                        <div className="text-xs text-green-700 mt-2">Using RWG vs ReLU</div>
                      </div>
                      <div className="p-6 bg-blue-50 rounded-xl border border-blue-100 text-center">
                         <div className="text-3xl font-bold text-blue-600 mb-2">-16%</div>
                         <div className="text-sm font-medium text-blue-900">Error Reduction</div>
                         <div className="text-xs text-blue-700 mt-2">Using Smart Pooling with ReLU</div>
                      </div>
                      <div className="p-6 bg-purple-50 rounded-xl border border-purple-100 text-center">
                         <div className="text-3xl font-bold text-purple-600 mb-2">Sensitive</div>
                         <div className="text-sm font-medium text-purple-900">Bias Layers</div>
                         <div className="text-xs text-purple-700 mt-2">Bias parameters are most fragile</div>
                      </div>
                   </div>

                   <div className="text-center pt-8 border-t border-slate-200">
                     <h4 className="font-bold text-slate-900 mb-2">Conclusion</h4>
                     <p className="max-w-3xl mx-auto text-slate-600">
                       The framework successfully demonstrates that architectural choices can inherently protect AI models from hardware faults without expensive hardware redundancy. <strong>RWG</strong> offers a passive, computationally efficient shield against radiation-induced errors.
                     </p>
                   </div>
                </div>
              </Section>
            )}

          </AnimatePresence>

        </main>
        
        <Navigation currentSection={currentSection} setSection={setCurrentSection} />

      </div>
    </div>
  );
}