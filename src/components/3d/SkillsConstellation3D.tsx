import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Layers } from 'lucide-react';

interface SkillNode {
  name: string;
  category: string;
  level: number;
  color: number;
  connections: number[];
  pos?: THREE.Vector3;
}

export const SkillsConstellation3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activeSkill, setActiveSkill] = useState<SkillNode | null>(null);

  const skillsData: SkillNode[] = [
    // Core Architecture
    { name: 'Flutter (Production)', category: 'core', level: 98, color: 0x00f5ff, connections: [1, 2, 3, 4, 8] },
    { name: 'Dart Language', category: 'core', level: 96, color: 0x00f5ff, connections: [0, 2, 3] },
    { name: 'Bloc / Cubit State', category: 'core', level: 95, color: 0x3d5afe, connections: [0, 1] },
    { name: 'Provider State', category: 'core', level: 92, color: 0x3d5afe, connections: [0, 1] },
    { name: 'Firebase & Cloud', category: 'core', level: 90, color: 0xffa000, connections: [0, 5] },
    { name: 'REST & GraphQL APIs', category: 'core', level: 94, color: 0x00f5ff, connections: [0, 4] },
    { name: 'WebSockets & WebRTC', category: 'core', level: 88, color: 0x3d5afe, connections: [0, 5] },

    // Interface & Creative Direction
    { name: 'UI/UX Architecture', category: 'design', level: 95, color: 0x7c4dff, connections: [0, 8, 9] },
    { name: 'Figma Prototyping', category: 'design', level: 94, color: 0x7c4dff, connections: [7, 9, 10] },
    { name: 'Design Systems', category: 'design', level: 92, color: 0x7c4dff, connections: [7, 8] },
    { name: 'Adobe XD & Vectors', category: 'design', level: 88, color: 0xff2a85, connections: [8] },

    // Web & Front-End
    { name: 'Modern JavaScript (ES6+)', category: 'web', level: 90, color: 0x00f5ff, connections: [12, 13] },
    { name: 'HTML5 & CSS3/SCSS', category: 'web', level: 92, color: 0x3d5afe, connections: [11, 13] },
    { name: 'Bootstrap & Responsive', category: 'web', level: 90, color: 0x7c4dff, connections: [11, 12] },

    // Visual & Motion
    { name: 'Adobe Photoshop', category: 'motion', level: 90, color: 0x3d5afe, connections: [7, 15] },
    { name: 'Motion Graphics', category: 'motion', level: 86, color: 0xff2a85, connections: [14, 16] },
    { name: 'Video Editing & Post', category: 'motion', level: 88, color: 0x7c4dff, connections: [15] },
  ];

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 0, 14);

    const group = new THREE.Group();
    scene.add(group);

    // Node coordinates in spherical/orbital shell
    const nodeMeshes: THREE.Mesh[] = [];
    const total = skillsData.length;

    skillsData.forEach((skill, i) => {
      const phi = Math.acos(-1 + (2 * i) / total);
      const theta = Math.sqrt(total * Math.PI) * phi;
      const radius = 5.2 + (i % 3) * 0.4;

      const pos = new THREE.Vector3(
        radius * Math.cos(theta) * Math.sin(phi),
        radius * Math.sin(theta) * Math.sin(phi),
        radius * Math.cos(phi)
      );
      skill.pos = pos;

      // Node Geometry
      const size = skill.name.includes('Flutter') ? 0.45 : 0.28;
      const geo = new THREE.IcosahedronGeometry(size, 2);
      const mat = new THREE.MeshStandardMaterial({
        color: skill.color,
        emissive: skill.color,
        emissiveIntensity: 0.6,
        roughness: 0.2,
        metalness: 0.8,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(pos);
      mesh.userData = { skillIndex: i };
      group.add(mesh);
      nodeMeshes.push(mesh);
    });

    // Connecting Network Lines
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x00f5ff,
      transparent: true,
      opacity: 0.22,
    });
    const lineGeo = new THREE.BufferGeometry();
    const linePositions: number[] = [];

    skillsData.forEach((skill) => {
      const sourcePos = skill.pos;
      if (!sourcePos) return;
      skill.connections.forEach((targetIdx) => {
        const target = skillsData[targetIdx];
        if (target && target.pos) {
          linePositions.push(sourcePos.x, sourcePos.y, sourcePos.z);
          linePositions.push(target.pos.x, target.pos.y, target.pos.z);
        }
      });
    });

    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    const lines = new THREE.LineSegments(lineGeo, lineMat);
    group.add(lines);

    // Ambient & Point light
    const ambient = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambient);

    const light1 = new THREE.PointLight(0x00f5ff, 2, 25);
    light1.position.set(6, 6, 8);
    scene.add(light1);

    // Raycaster for Hover
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-999, -999);

    const onPointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };

    container.addEventListener('mousemove', onPointerMove);

    // Drag Orbit
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    };
    const onMouseMoveDoc = (e: MouseEvent) => {
      if (isDragging) {
        const dx = e.clientX - prevMouse.x;
        const dy = e.clientY - prevMouse.y;
        group.rotation.y += dx * 0.005;
        group.rotation.x += dy * 0.005;
        prevMouse = { x: e.clientX, y: e.clientY };
      }
    };
    const onMouseUp = () => (isDragging = false);

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMoveDoc);
    window.addEventListener('mouseup', onMouseUp);

    // Resize
    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // Animation
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      if (!isDragging) {
        group.rotation.y += 0.0025;
        group.rotation.x = Math.sin(time * 0.4) * 0.15;
      }

      // Check hover
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeMeshes);

      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        const idx = hit.userData.skillIndex;
        if (skillsData[idx]) {
          setActiveSkill(skillsData[idx]);
          hit.scale.set(1.4, 1.4, 1.4);
        }
      } else {
        nodeMeshes.forEach((m) => m.scale.set(1, 1, 1));
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('mousemove', onPointerMove);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMoveDoc);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', onResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      lineGeo.dispose();
      lineMat.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-[480px] lg:h-[580px] glass-panel rounded-3xl overflow-hidden border border-[#00F5FF]/20">
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top HUD category pills */}
      <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 pointer-events-auto">
        <div className="flex items-center gap-2 bg-[#05060A]/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs font-mono">
          <Layers className="w-3.5 h-3.5 text-[#00F5FF]" />
          <span className="text-slate-300">INTERACTIVE 3D CONSTELLATION GRAPH</span>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400 hidden sm:inline">Drag to Orbit / Hover Node</span>
          <span className="w-2 h-2 rounded-full bg-[#00F5FF] animate-pulse" />
        </div>
      </div>

      {/* Active Skill Telemetry Overlay */}
      {activeSkill && (
        <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:w-80 glass-panel p-4 rounded-2xl border border-[#00F5FF]/30 backdrop-blur-2xl transition-all pointer-events-none animate-fadeIn">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-[#00F5FF] uppercase tracking-wider">
              {activeSkill.category} MATRIX
            </span>
            <span className="text-xs font-mono font-bold text-emerald-400">
              {activeSkill.level}% PROFICIENCY
            </span>
          </div>

          <h4 className="text-lg font-bold font-space text-white mb-2">{activeSkill.name}</h4>

          <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#00F5FF] via-[#3D5AFE] to-[#7C4DFF] rounded-full"
              style={{ width: `${activeSkill.level}%` }}
            />
          </div>

          <p className="text-[11px] font-mono text-slate-400 mt-2">
            Interconnected with {activeSkill.connections.length} system framework nodes.
          </p>
        </div>
      )}
    </div>
  );
};
