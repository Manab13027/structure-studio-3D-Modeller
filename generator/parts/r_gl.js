  // ================================================================ GL
  const vs = `#version 300 es
  layout(location=0) in vec3 aP; layout(location=1) in vec3 aN; layout(location=2) in vec2 aU;
  uniform mat4 uVP; out vec3 vN; out vec2 vU; out vec3 vW;
  void main(){ vN=aN; vU=aU; vW=aP; gl_Position=uVP*vec4(aP,1.0); }`;
  const fs = `#version 300 es
  precision highp float; precision highp sampler2DShadow;
  in vec3 vN; in vec2 vU; in vec3 vW; out vec4 o;
  uniform vec3 uColor; uniform float uEmit; uniform float uTex; uniform sampler2D uS; uniform float uMetal; uniform float uRough;
  uniform vec3 uEye; uniform float uRoomR; uniform sampler2DShadow uSh; uniform mat4 uL; uniform vec3 uLdir; uniform float uShOn; uniform float uFz; uniform float uCut; uniform float uFol;
  float shadow(vec3 n){
    vec4 lp = uL * vec4(vW + n * 0.02, 1.0); vec3 c = lp.xyz / lp.w * 0.5 + 0.5;
    if (c.x < 0.0 || c.x > 1.0 || c.y < 0.0 || c.y > 1.0 || uShOn < 0.5) return 1.0;
    float s = 0.0; vec2 t = vec2(1.0 / 2048.0);
    for (int x = -1; x <= 1; x++) for (int y = -1; y <= 1; y++) s += texture(uSh, vec3(c.xy + vec2(x, y) * t * 1.6, c.z - 0.0008));
    return s / 9.0;
  }
  void main(){
    vec4 tx = uTex > 0.5 ? texture(uS, vU) : vec4(1.0);
    if (uCut > 0.5) { vec2 g = vU * 512.0; float mip = max(0.0, 0.5 * log2(max(dot(dFdx(g), dFdx(g)), dot(dFdy(g), dFdy(g)))));
      if (tx.a * (1.0 + 0.3 * min(mip, 3.0)) < 0.5) discard; }   // keep distant foliage as dense as close up                          // leaf cards: cut out around the leaves
    vec3 n = normalize(vN); if (!gl_FrontFacing && uFol < 0.5) n = -n;
    vec3 alb = uColor * tx.rgb;
    alb = pow(alb, vec3(2.2));                                   // work in linear light
    vec3 L1 = normalize(uLdir); vec3 L2 = normalize(vec3(-0.6, 0.5, 0.5));
    float sh = shadow(n);
    float k1 = max(dot(n, L1), 0.0) * sh, k2 = max(dot(n, L2), 0.0);
    if (uFol > 0.5) { k1 = (0.35 + 0.65 * max(dot(n, L1), 0.0)) * sh; }   // foliage: light passes through leaves
    vec3 V = normalize(uEye - vW); vec3 H = normalize(L1 + V);
    float gloss = mix(160.0, 6.0, uRough);
    float spec = pow(max(dot(n, H), 0.0), gloss) * (1.0 - uRough) * (gloss + 8.0) / 60.0 * sh;
    float fres = pow(1.0 - max(dot(n, V), 0.0), 5.0) * (1.0 - uRough) * 0.25;
    // sky/ground ambient with a soft "contact" darkening near the floor on vertical faces
    float hemi = mix(0.10, 0.24, n.z * 0.5 + 0.5);
    float ao = mix(0.55, 1.0, smoothstep(0.0, 0.45, vW.z - uFz)) ; ao = mix(ao, 1.0, max(n.z, 0.0));
    float pool = 1.0 - 0.25 * smoothstep(uRoomR * 0.4, uRoomR, length(vW.xy));
    vec3 spec_c = mix(vec3(0.9), alb, uMetal);
    vec3 diff = alb * (1.0 - uMetal * 0.7);
    vec3 lit = (diff * (hemi * ao + k1 * 1.05 + k2 * 0.22) + spec_c * (spec + fres)) * pool;
    float e = clamp(uEmit / 1.4, 0.0, 1.0);
    vec3 col = mix(lit, alb * (0.75 + 0.35 * uEmit), e);
    col = col / (col + vec3(0.62)) * 1.55;                         // gentle filmic shoulder
    o = vec4(pow(col, vec3(1.0 / 2.2)), 1.0);
  }`;
  const svs = `#version 300 es
  layout(location=0) in vec3 aP; layout(location=2) in vec2 aU; uniform mat4 uL; out vec2 vU; void main(){ vU = aU; gl_Position = uL * vec4(aP, 1.0); }`;
  const sfs = `#version 300 es
  precision mediump float; in vec2 vU; uniform sampler2D uS; uniform float uCut; out vec4 o; void main(){ if (uCut > 0.5 && texture(uS, vU).a < 0.3) discard; o = vec4(1.0); }`;
  function sh(t, s) { const x = gl.createShader(t); gl.shaderSource(x, s); gl.compileShader(x); if (!gl.getShaderParameter(x, gl.COMPILE_STATUS)) throw gl.getShaderInfoLog(x); return x; }
  function program(v, f) { const p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, v)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, f)); gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw gl.getProgramInfoLog(p); return p; }
  const prog = program(vs, fs), sprog = program(svs, sfs);
  const U = Object.fromEntries(["VP", "Color", "Emit", "Tex", "S", "Metal", "Rough", "Eye", "RoomR", "Sh", "L", "Ldir", "ShOn", "Fz", "Cut", "Fol"].map(n => [n, gl.getUniformLocation(prog, "u" + n)]));
  const SU = { L: gl.getUniformLocation(sprog, "uL"), S: gl.getUniformLocation(sprog, "uS"), Cut: gl.getUniformLocation(sprog, "uCut") };
  const aniso = gl.getExtension("EXT_texture_filter_anisotropic");
  gl.enable(gl.DEPTH_TEST); gl.enable(gl.CULL_FACE); gl.cullFace(gl.BACK);

  // shadow map
  const SHADOW = 2048, shTex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, shTex);
  gl.texStorage2D(gl.TEXTURE_2D, 1, gl.DEPTH_COMPONENT24, SHADOW, SHADOW);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_MODE, gl.COMPARE_REF_TO_TEXTURE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_FUNC, gl.LEQUAL);
  const shFbo = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, shFbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, shTex, 0); gl.drawBuffers([gl.NONE]); gl.readBuffer(gl.NONE);
  const shadowOK = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  const LDIR = [0.32, -0.42, 0.85];
  let LMAT = null, shadowDirty = true;

  const textures = {};
  function ensureTex(key) {
    if (!TEX[key] && key.startsWith("leaf_")) { TEX[key] = drawLeafTex(key); EMIT[key] = 0; }
    if (LEAF_PIX[key] && !textures[key]) {   // foliage: upload the colour-dilated pixels directly
      const t = gl.createTexture(), L = LEAF_PIX[key]; textures[key] = { t }; gl.bindTexture(gl.TEXTURE_2D, t); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, L.S, L.S, 0, gl.RGBA, gl.UNSIGNED_BYTE, L.px); gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      if (aniso) gl.texParameterf(gl.TEXTURE_2D, aniso.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(8, gl.getParameter(aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT)));
      dirty = true; return;
    }
    if (textures[key] || !TEX[key]) return;
    const t = gl.createTexture(); textures[key] = { t };
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([60, 60, 60, 255]));
    const img = new Image();
    img.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, t); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img); gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      const rep = key === "floor" || key.startsWith("asset_") || key.startsWith("fin_") ? gl.REPEAT : gl.CLAMP_TO_EDGE;
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, rep); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, rep);
      if (aniso) gl.texParameterf(gl.TEXTURE_2D, aniso.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(8, gl.getParameter(aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT)));
      dirty = true;
    };
    img.src = TEX[key];
  }
