import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const exercises = [
  {
    id: 1,
    name: "Push Up",
    category: "Upper Body",
    level: "Beginner",
    target: "45 sec",
    sets: "3 sets",
    model: "/models/push_up.glb",
    view: { yaw: -0.25, pitch: 0, zoom: 1.22, yOffset: 0.04 },
    muscles: ["Chest", "Shoulders", "Triceps"],
    desc: "A basic upper-body movement for chest, arms, and core stability.",
    steps: [
      "Start in a high plank position.",
      "Keep your body straight from head to heels.",
      "Lower your chest near the floor.",
      "Push back up with control."
    ]
  },
  {
    id: 2,
    name: "Air Squat",
    category: "Lower Body",
    level: "Beginner",
    target: "60 sec",
    sets: "3 sets",
    model: "/models/air_squat.glb",
    view: { yaw: 0.1, pitch: 0, zoom: 1.35, yOffset: 0.02 },
    muscles: ["Quads", "Glutes", "Hamstrings"],
    desc: "A basic lower-body exercise for legs, hips, and balance.",
    steps: [
      "Stand shoulder-width apart.",
      "Push hips back.",
      "Bend knees and squat.",
      "Stand back up with control."
    ]
  },
  {
    id: 3,
    name: "Jumping Jack",
    category: "Cardio",
    level: "Beginner",
    target: "45 sec",
    sets: "3 sets",
    model: "/models/jumping_jack_sample_animation.glb",
    view: { yaw: 0, pitch: 0, zoom: 1.1, yOffset: 0 },
    muscles: ["Full Body", "Legs", "Shoulders"],
    desc: "A cardio movement that warms up the full body.",
    steps: [
      "Stand straight with arms at your sides.",
      "Jump feet outward.",
      "Raise arms overhead at the same time.",
      "Return to starting position and repeat."
    ]
  },
  {
    id: 4,
    name: "Burpee",
    category: "Full Body",
    level: "Intermediate",
    target: "30 sec",
    sets: "3 sets",
    model: "/models/burpee.glb",
    view: { yaw: 0.15, pitch: 0, zoom: 1.28, yOffset: 0.03 },
    muscles: ["Full Body", "Core", "Legs"],
    desc: "A full-body conditioning exercise for strength and cardio.",
    steps: [
      "Start standing.",
      "Drop into a squat.",
      "Kick feet back to plank.",
      "Return and jump up."
    ]
  },
  {
    id: 5,
    name: "Crunch",
    category: "Core",
    level: "Beginner",
    target: "15 reps",
    sets: "3 sets",
    model: "/models/bodyweight_crunch_3d_animation.glb",
    view: { yaw: -0.15, pitch: 0, zoom: 1.34, yOffset: 0.05 },
    sceneBackground: "#f2f2f2",
    muscles: ["Abs", "Core"],
    desc: "A core exercise that targets the abdominal muscles.",
    steps: [
      "Lie on your back.",
      "Bend your knees.",
      "Lift your upper body slightly.",
      "Lower slowly."
    ]
  },
  {
    id: 6,
    name: "Bicep Curl",
    category: "Upper Body",
    level: "Beginner",
    target: "12 reps",
    sets: "3 sets",
    model: "/models/barbell_bicep_curl_3d_animation.glb",
    view: { yaw: 0, pitch: 0, zoom: 1.18, yOffset: 0.02 },
    sceneBackground: "#e9e9e9",
    muscles: ["Biceps", "Forearms"],
    desc: "An arm exercise that targets the biceps.",
    steps: [
      "Stand tall.",
      "Hold the bar or dumbbells.",
      "Curl toward your chest.",
      "Lower with control."
    ]
  },
  {
    id: 7,
    name: "Crescent Lunge",
    category: "Lower Body",
    level: "Beginner",
    target: "10 each leg",
    sets: "3 sets",
    model: "/models/overhead_crescent_lunge.glb",
    view: { yaw: 0, pitch: 0, zoom: 1.16, yOffset: 0 },
    muscles: ["Quads", "Glutes", "Core"],
    desc: "A lunge variation that improves balance and lower-body strength.",
    steps: [
      "Step one foot forward.",
      "Keep your back leg extended.",
      "Raise arms overhead.",
      "Hold and switch sides."
    ]
  }
];

const categories = ["All", "Upper Body", "Lower Body", "Core", "Cardio", "Full Body"];

function LoadingPill({ children }) {
  return <div className="modelStatus">{children}</div>;
}

function FitnessModelViewer({ src, view, sceneBackground = "#020202" }) {
  const mountRef = useRef(null);
  const [status, setStatus] = useState("Loading model...");
  const [hint, setHint] = useState("Drag to rotate");
  const isLightScene = sceneBackground !== "#020202";

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    mount.innerHTML = "";
    setStatus("Loading model...");
    setHint("Drag to rotate");

    let disposed = false;
    let model = null;
    let mixer = null;
    let animationId = null;
    let resizeObserver = null;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(sceneBackground);

    const camera = new THREE.PerspectiveCamera(30, 1, 0.01, 5000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    renderer.setClearColor(sceneBackground, 1);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = 0.8;
    controls.maxDistance = 30;
    controls.target.set(0, 0, 0);

    const hemi = new THREE.HemisphereLight(0xffffff, 0x161616, 2.6);
    scene.add(hemi);

    const key = new THREE.DirectionalLight(0xffffff, 3.2);
    key.position.set(3.5, 5, 5);
    scene.add(key);

    const fill = new THREE.DirectionalLight(0xffffff, 1.6);
    fill.position.set(-4, 2, 3);
    scene.add(fill);

    const rim = new THREE.DirectionalLight(0xffffff, 1.8);
    rim.position.set(0, 3, -5);
    scene.add(rim);

    const clock = new THREE.Clock();

    const resize = () => {
      if (!mount || !renderer || !camera) return;
      const rect = mount.getBoundingClientRect();
      const width = Math.max(320, rect.width || mount.clientWidth || 900);
      const height = Math.max(360, rect.height || mount.clientHeight || 620);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const centerAndFitModel = () => {
      if (!model) return;

      // Update world matrices before reading the box.
      model.updateWorldMatrix(true, true);

      const box = new THREE.Box3().setFromObject(model);
      const size = new THREE.Vector3();
      const center = new THREE.Vector3();
      box.getSize(size);
      box.getCenter(center);

      // Move the actual animated model to the exact center of the viewer.
      model.position.sub(center);
      model.position.y += view?.yOffset || 0;
      model.updateWorldMatrix(true, true);

      const fittedBox = new THREE.Box3().setFromObject(model);
      const fittedSize = new THREE.Vector3();
      const fittedCenter = new THREE.Vector3();
      fittedBox.getSize(fittedSize);
      fittedBox.getCenter(fittedCenter);

      const maxDim = Math.max(fittedSize.x, fittedSize.y, fittedSize.z, 1);
      const radius = maxDim * 0.55;
      const fov = THREE.MathUtils.degToRad(camera.fov);
      let distance = radius / Math.sin(fov / 2);
      distance *= view?.zoom || 1.2;

      const yaw = view?.yaw || 0;
      const pitch = view?.pitch || 0;
      camera.position.set(
        Math.sin(yaw) * distance,
        fittedCenter.y + Math.sin(pitch) * distance + fittedSize.y * 0.04,
        Math.cos(yaw) * distance
      );

      controls.target.copy(fittedCenter);
      controls.minDistance = distance * 0.45;
      controls.maxDistance = distance * 2.8;
      controls.update();
      camera.lookAt(fittedCenter);
    };

    resize();
    resizeObserver = new ResizeObserver(() => {
      resize();
      centerAndFitModel();
    });
    resizeObserver.observe(mount);

    const loader = new GLTFLoader();
    loader.load(
      src,
      (gltf) => {
        if (disposed) return;
        model = gltf.scene;

        model.traverse((child) => {
          if (!child.isMesh) return;
          child.frustumCulled = false;
          child.castShadow = false;
          child.receiveShadow = false;

          const makeFallback = () => new THREE.MeshStandardMaterial({
            color: 0xf6f6f6,
            roughness: 0.58,
            metalness: 0.02,
            side: THREE.DoubleSide
          });

          if (!child.material) {
            child.material = makeFallback();
          }

          const mats = Array.isArray(child.material) ? child.material : [child.material];
          mats.forEach((mat) => {
            if (!mat) return;
            mat.side = THREE.DoubleSide;
            mat.needsUpdate = true;
            if (mat.map) mat.map.colorSpace = THREE.SRGBColorSpace;
          });
        });

        scene.add(model);

        // Play first animation immediately. Some models have a bad first frame,
        // so we also sample the animation for a few frames before fitting.
        if (gltf.animations && gltf.animations.length > 0) {
          mixer = new THREE.AnimationMixer(model);
          const clip = gltf.animations[0];
          const action = mixer.clipAction(clip);
          action.reset();
          action.play();

          // Move timeline slightly forward to avoid T-pose / extreme first frame bounds.
          mixer.update(Math.min(0.25, clip.duration * 0.08));
        }

        // Normalize if model is unusually huge/small.
        model.updateWorldMatrix(true, true);
        const rawBox = new THREE.Box3().setFromObject(model);
        const rawSize = new THREE.Vector3();
        rawBox.getSize(rawSize);
        const rawMax = Math.max(rawSize.x, rawSize.y, rawSize.z);
        if (rawMax > 0) {
          const targetMax = 3.2;
          model.scale.multiplyScalar(targetMax / rawMax);
        }

        centerAndFitModel();
        setStatus("");
      },
      undefined,
      (err) => {
        console.error("GLB load error:", src, err);
        setStatus("Cannot load this GLB. Check filename or re-download model.");
      }
    );

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      if (mixer) mixer.update(delta);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      disposed = true;
      if (animationId) cancelAnimationFrame(animationId);
      if (resizeObserver) resizeObserver.disconnect();
      controls.dispose();
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
          materials.forEach((mat) => {
            Object.keys(mat).forEach((key) => {
              const value = mat[key];
              if (value && typeof value.dispose === "function") value.dispose();
            });
            mat.dispose?.();
          });
        }
      });
      renderer.dispose();
      mount.innerHTML = "";
    };
  }, [sceneBackground, src, view]);

  return (
    <div className="viewerShell" style={{ background: sceneBackground }}>
      <div ref={mountRef} className="viewerMount" />
      {status ? <LoadingPill>{status}</LoadingPill> : <div className="viewerHint" style={isLightScene ? { color: "rgba(0, 0, 0, 0.72)" } : undefined}>{hint}</div>}
    </div>
  );
}

export default function App() {
  const [selected, setSelected] = useState(exercises[0]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  const filteredExercises = useMemo(() => {
    return exercises.filter((exercise) => {
      const categoryMatch = activeCategory === "All" || exercise.category === activeCategory;
      const searchText = `${exercise.name} ${exercise.category} ${exercise.level}`.toLowerCase();
      const searchMatch = searchText.includes(search.trim().toLowerCase());
      return categoryMatch && searchMatch;
    });
  }, [activeCategory, search]);

  return (
    <div className="app">
      <header className="topbar">
        <a className="brand" href="#home" aria-label="Gym Buddy home">
          <div className="brandLogo">GB</div>
          <div>
            <h1>Gym Buddy</h1>
            <p>AR Fitness Trainer Assistant</p>
          </div>
        </a>

        <nav>
          <a href="#home">Home</a>
          <a href="#trainer">Trainer</a>
          <a href="#library">Exercises</a>
        </nav>
      </header>

      <main>
        <section id="home" className="hero">
          <div className="heroCopy">
            <p className="eyebrow">AR FITNESS GUIDE</p>
            <h2>Your personal 3D workout companion.</h2>
            <p>
              Choose an exercise, watch the animated 3D guide, and follow simple
              steps for safer training.
            </p>

            <div className="heroActions">
              <a className="primaryBtn" href="#trainer">Start Training</a>
              <a className="ghostBtn" href="#library">View Exercises</a>
            </div>
          </div>

          <div className="phoneCard">
            <div className="phoneHeader">
              <div className="brandLogo small">GB</div>
              <div>
                <strong>Gym Buddy</strong>
                <span>AR Fitness Trainer Assistant</span>
              </div>
            </div>
            <div className="phoneModel">
              <FitnessModelViewer src={selected.model} view={selected.view} sceneBackground={selected.sceneBackground} />
            </div>
            <div className="phoneSelected">
              <strong>{selected.name}</strong>
              <span>{selected.category}</span>
            </div>
          </div>
        </section>

        <section id="trainer" className="trainerSection">
          <div className="trainerLeft panel">
            <p className="eyebrow">INTERACTIVE TRAINER</p>
            <h2>{selected.name}</h2>
            <p className="trainerDesc">{selected.desc}</p>

            <div className="mainViewer">
              <FitnessModelViewer src={selected.model} view={selected.view} sceneBackground={selected.sceneBackground} />
            </div>
          </div>

          <aside className="trainerRight panel">
            <div className="statsGrid">
              <div className="statBox">
                <span>Category</span>
                <strong>{selected.category}</strong>
              </div>
              <div className="statBox">
                <span>Level</span>
                <strong>{selected.level}</strong>
              </div>
              <div className="statBox">
                <span>Target</span>
                <strong>{selected.target}</strong>
              </div>
              <div className="statBox">
                <span>Sets</span>
                <strong>{selected.sets}</strong>
              </div>
            </div>

            <div className="infoBlock">
              <h3>Target muscles</h3>
              <div className="muscleTags">
                {selected.muscles.map((muscle) => <span key={muscle}>{muscle}</span>)}
              </div>
            </div>

            <div className="infoBlock">
              <h3>How to do it</h3>
              <ol>
                {selected.steps.map((step) => <li key={step}>{step}</li>)}
              </ol>
            </div>

            <div className="featureList">
              <div className="featureCard">
                <b>▶</b>
                <div>
                  <h4>Animated 3D Guide</h4>
                  <p>Watch the movement before performing the exercise.</p>
                </div>
              </div>
              <div className="featureCard">
                <b>◎</b>
                <div>
                  <h4>AR Viewer</h4>
                  <p>Use the 3D guide as preparation for AR presentation.</p>
                </div>
              </div>
              <div className="featureCard">
                <b>✓</b>
                <div>
                  <h4>Step-by-step</h4>
                  <p>Follow simple instructions for safer training.</p>
                </div>
              </div>
            </div>
          </aside>
        </section>

        <section id="library" className="librarySection">
          <div className="libraryHeader">
            <div>
              <p className="eyebrow">EXERCISE LIBRARY</p>
              <h2>Choose your guide</h2>
            </div>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search exercise..."
            />
          </div>

          <div className="filters">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={activeCategory === category ? "active" : ""}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="exerciseGrid">
            {filteredExercises.map((exercise) => (
              <button
                key={exercise.id}
                className={`exerciseCard ${selected.id === exercise.id ? "selected" : ""}`}
                onClick={() => {
                  setSelected(exercise);
                  document.querySelector("#trainer")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <span>{exercise.category}</span>
                <h3>{exercise.name}</h3>
                <p>{exercise.desc}</p>
                <small>{exercise.target} • {exercise.sets}</small>
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
