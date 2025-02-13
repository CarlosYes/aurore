function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}class BackgroundMaterial extends THREE.RawShaderMaterial {
































































































































































  constructor() {
    super(BackgroundMaterial.shader);_defineProperty(this, "resize",





    () => {
      this.uniforms.resolution.value.set(
      window.innerWidth * window.devicePixelRatio,
      window.innerHeight * window.devicePixelRatio);

    });_defineProperty(this, "loop",

    timestamp => {
      requestAnimationFrame(this.loop);
      this.uniforms.globalTime.value = timestamp / 1000;
    });addEventListener('resize', this.resize);requestAnimationFrame(this.loop);}}_defineProperty(BackgroundMaterial, "shader", { vertexShader: `
      attribute vec3 position;

      uniform mat4 projectionMatrix;
      uniform mat4 modelViewMatrix;

      void main() {
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
      }
    `, fragmentShader: `
      #ifdef GL_ES
      precision mediump float;
      #endif

      #define OCTAVES 2
      #define RGB(r, g, b) vec3(float(r) / 255.0, float(g) / 255.0, float(b) / 255.0)

      uniform vec2 resolution;
      uniform float globalTime;

      float random(vec2 co) {
          return fract(sin(dot(co.xy, vec2(12.9898,78.233))) * 43758.5453);
      }

      vec2 rand2(vec2 p) {
          p = vec2(dot(p, vec2(12.9898,78.233)), dot(p, vec2(26.65125, 83.054543))); 
          return fract(sin(p) * 43758.5453);
      }

      float rand(vec2 p) {
          return fract(sin(dot(p.xy ,vec2(54.90898,18.233))) * 4337.5453);
      }



      //
      // Description : Array and textureless GLSL 2D simplex noise function.
      //      Author : Ian McEwan, Ashima Arts.
      //  Maintainer : ijm
      //     Lastmod : 20110822 (ijm)
      //     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
      //               Distributed under the MIT License. See LICENSE file.
      //               https://github.com/ashima/webgl-noise
      //

      vec3 mod289(vec3 x) {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
      }

      vec2 mod289(vec2 x) {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
      }

      vec3 permute(vec3 x) {
        return mod289(((x*34.0)+1.0)*x);
      }

      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                            0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                           -0.577350269189626,  // -1.0 + 2.0 * C.x
                            0.024390243902439); // 1.0 / 41.0
        vec2 i  = floor(v + dot(v, C.yy) );
        vec2 x0 = v -   i + dot(i, C.xx);

        vec2 i1;
        i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;

        i = mod289(i); // Avoid truncation effects in permutation
        vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
          + i.x + vec3(0.0, i1.x, 1.0 ));

        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m ;
        m = m*m ;

        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;

        m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );

        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }

      // Thanks to andmar1x https://www.shadertoy.com/view/MtB3zW
      float stars(in vec2 x, float numCells, float size, float br) {
        vec2 n = x * numCells;
        vec2 f = floor(n);

        float d = 1.0e10;
        for (int i = -1; i <= 1; ++i)
        {
          for (int j = -1; j <= 1; ++j)
          {
            vec2 g = f + vec2(float(i), float(j));
            g = n - g - rand2(mod(g, numCells)) + rand(g);
            // Control size
            g *= 1. / (numCells * size);
            d = min(d, dot(g, g));
          }
        }

        return br * (smoothstep(.95, 1., (1. - sqrt(d))));
      }

      float fractalNoise(in vec2 coord, in float persistence, in float lacunarity) {    
          float n = 0.;
          float frequency = 3.;
          float amplitude = 2.;
          for (int o = 0; o < OCTAVES; ++o)
          {
              n += amplitude * snoise(coord * frequency);
              amplitude *= persistence;
              frequency *= lacunarity;
          }
          return n;
      }

      void main() {
        vec2 coord = gl_FragCoord.xy / resolution.xy;
        vec2 starCoord = gl_FragCoord.xy / resolution.yy - vec2(.5, 0);
        vec3 color1 = RGB(10, 70, 50) * 1.5;
        vec3 color2 = RGB(50, 0, 40) * 1.1;
        float dist = distance(coord, vec2(0.5, 0.3)) * 1.5;

        float time = -globalTime / 100.;

        mat2 RotationMatrix = mat2(cos(time), sin(time), -sin(time), cos(time));
        vec3 starField = stars(starCoord * RotationMatrix, 16., 0.03, 0.8) * vec3(.9, .9, .95);
             starField += stars(starCoord * RotationMatrix, 40., 0.025, 1.0) * vec3(.9, .9, .95) * max(0.0, fractalNoise(starCoord * RotationMatrix, .5, .2));

        vec3 aurora = RGB(0,255,130) * max(snoise(vec2((coord.x + sin(time)) * 15., coord.x * 40.)) * max((sin(10.0 * (coord.x + 2. * time)) *.1 + 1.26) - 2. * coord.y, 0.), 0.);
        vec3 aurora2 = RGB(0,235,170) * max(snoise(vec2((.09 * coord.x + sin(time * .5)) * 15., coord.x * 1.)) * max((sin(5.0 * (coord.x + 1.5 * time)) *.1 + 1.28) - 2. * coord.y, 0.), 0.);

        vec3 result = starField + aurora * aurora2.g * 3.5 + aurora2;

        gl_FragColor = vec4(mix(color1, color2, dist), 1.0);
        gl_FragColor.rgb += result;
      }

    `, uniforms: { resolution: { value: new THREE.Vector2(window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio) }, globalTime: { value: performance.now() / 1000 } }, side: THREE.BackSide });class MountainMaterial extends THREE.ShaderMaterial {constructor() {super(MountainMaterial.shader);}}_defineProperty(MountainMaterial, "shader", { vertexShader: `
      uniform vec3 mvPosition;

      varying vec2 vUv;
      varying float fogDepth;

      void main() {
        fogDepth = -mvPosition.z;
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
      }
    `, fragmentShader: `
      #ifdef GL_ES
      precision mediump float;
      #endif

      varying vec2 vUv;

      #include <fog_pars_fragment>

      float random(vec2 co) {
          return fract(sin(dot(co.xy, vec2(12.9898,78.233))) * 43758.5453);
      }

      vec2 rand2(vec2 p)
      {
          p = vec2(dot(p, vec2(12.9898,78.233)), dot(p, vec2(26.65125, 83.054543))); 
          return fract(sin(p) * 43758.5453);
      }

      float rand(vec2 p)
      {
          return fract(sin(dot(p.xy ,vec2(54.90898,18.233))) * 4337.5453);
      }

      void main() {
        float offset = random(vec2(gl_FragCoord.w));
        vec2 c = vUv;
        vec2 p = vUv;
        p *= .3;
        p.y = p.y * 30. - 4.;
        p.x = p.x * (80. * offset) + 14.8 * offset;
        vec2 q = (p - vec2(0.5,0.5)) * 1.;
        // p = q;
        vec3 col = vec3(0.);

        float h = max(
          .0,
          max(
            max(
              abs(fract(p.x)-.5)-.25, 
              3.*(abs(fract(.7*p.x+.4)-.5)-.4) 
            ),
            max(
              1.2*(abs(fract(.8*p.x+.6)-.5)-.2), 
              .3*(abs(fract(.5*p.x+.2)-.5)) 
            ) 
          )
        );
        float fill = 1.0 - smoothstep(h, h+.001, p.y);

        vec3 col2 = col * min(fill, 2.0);

        gl_FragColor = vec4(col2, fill);

        #ifdef USE_FOG
          #ifdef USE_LOGDEPTHBUF_EXT
            float depth = gl_FragDepthEXT / gl_FragCoord.w;
          #else
            float depth = gl_FragCoord.z / gl_FragCoord.w;
          #endif
          float fogFactor = smoothstep(fogNear, fogFar, depth);
          gl_FragColor.rgb = mix(gl_FragColor.rgb, fogColor, fogFactor);
        #endif
      }
    `, uniforms: THREE.UniformsLib.fog, fog: true, transparent: true });class TreeMaterial extends THREE.RawShaderMaterial {constructor() {super(TreeMaterial.shader);_defineProperty(this, "loop", timestamp => {requestAnimationFrame(this.loop);this.uniforms.globalTime.value = timestamp / 1000;});requestAnimationFrame(this.loop);}}_defineProperty(TreeMaterial, "shader", { vertexShader: `
      attribute vec3 position;
      attribute vec2 uv;

      uniform mat4 projectionMatrix;
      uniform mat4 modelViewMatrix;

      varying vec2 vUv;

      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
      }
    `, fragmentShader: `
      #ifdef GL_ES
      precision mediump float;
      #endif

      #define RGB(r, g, b) vec3(float(r) / 255.0, float(g) / 255.0, float(b) / 255.0)

      uniform float globalTime;

      varying vec2 vUv;

      float treeFill(in float size, in vec2 offset) {
        vec2 p = vUv;
        vec2 q = p - vec2(0.5,0.5);
          vec2 q1 = 100.0 / size * q - offset;
          float r= mod(-0.8*q1.y,1.-0.06*q1.y) * -0.05*q1.y - .1*q1.y;
          float fill = (1.0 - smoothstep(r, r+0.001, abs(q1.x+0.5*sin(0.9 * globalTime + p.x * 25.0)*(1.0 + q1.y/13.0)))) * smoothstep(0.0, 0.01, q1.y + 13.0);
          return fill;
      }

      vec4 tree(in float size, in vec2 offset) {
        float glowDist = 0.12;
        vec3 glowColor = RGB(11, 115, 95);
        float tree = treeFill(size, offset);
        float treeGlow = treeFill(size, vec2(offset.x + glowDist, offset.y));
        return max(vec4(glowColor * (treeGlow - tree), treeGlow), vec4(0.0));
      }

      void main() {
        vec2 c = vUv;
        vec2 p = vUv;
        p *= 0.3;
        p.y = p.y * 30.0 - 4.0;
        p.x = p.x * 30.0;
        vec2 q = (p - vec2(0.5,0.5)) * 5.5;

        vec4 col = tree(1.0, vec2(-30.0, 7.0));
              col += tree(1.2, vec2(-15.0, 8.0));
              col += tree(1.1, vec2(-12.0, 4.0));
              col += tree(1.0, vec2(-9.0, 6.0));
              col += tree(1.1, vec2(-10.0, 3.0));
              col += tree(1.0, vec2(-3.0, 4.0));
              col += tree(1.1, vec2(-1.5, 5.0));
              col += tree(1.0, vec2(5.0, 3.0));
              col += tree(1.3, vec2(12.0, 8.0));
              col += tree(0.9, vec2(15.0, 7.0));
              col += tree(1.0, vec2(18.0, 7.0));
              col += tree(1.1, vec2(26.0, 7.0));

        gl_FragColor = vec4(max(col.rgb * p.y, vec3(0.0)), col.a);
      }
    `, uniforms: { globalTime: { value: performance.now() / 1000 } }, transparent: true });class Scene {constructor() {_defineProperty(this, "onWindowResize", () => {this.camera.aspect = window.innerWidth / window.innerHeight;this.camera.updateProjectionMatrix();this.renderer.setSize(window.innerWidth, window.innerHeight);});_defineProperty(this, "update", timestamp => {requestAnimationFrame(this.update);this.renderer.render(this.scene, this.camera);});this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 5000);this.camera.position.z = 40;this.scene = new THREE.Scene();this.scene.fog = new THREE.Fog(0xFF00FF, 40, 180);this.renderer = new THREE.WebGLRenderer({ antialias: true });this.renderer.setPixelRatio(window.devicePixelRatio);this.renderer.setSize(window.innerWidth, window.innerHeight);document.body.appendChild(this.renderer.domElement);this.clock = new THREE.Clock();window.addEventListener('resize', this.onWindowResize);const backgroundGeometry = new THREE.SphereGeometry(4000, 32, 15);const backgroundMaterial = new BackgroundMaterial();const background = new THREE.Mesh(backgroundGeometry, backgroundMaterial);this.scene.add(background);const treeGeometry = new THREE.PlaneGeometry(200, 200, 1, 1);const treeMaterial = new TreeMaterial();this.tree = new THREE.Mesh(treeGeometry, treeMaterial);this.tree.position.z = 0.1;this.scene.add(this.tree);MountainMaterial.uniforms = { fogColor: { value: this.scene.fog.color }, fogNear: { value: this.scene.fog.near }, fogFar: { value: this.scene.fog.far } };const mountainMaterial = new MountainMaterial();const mountainGeometry = new THREE.PlaneGeometry(600, 200, 1, 1);const mountain = new THREE.Mesh(mountainGeometry, mountainMaterial);mountain.position.set(0, 0, 0);const mountain2 = new THREE.Mesh(mountainGeometry, mountainMaterial);mountain2.position.set(0, -2, -26);const mountain3 = new THREE.Mesh(mountainGeometry, mountainMaterial);mountain3.position.set(0, 0, -35);this.scene.add(mountain);this.scene.add(mountain2);this.scene.add(mountain3);requestAnimationFrame(this.update);}}new Scene();