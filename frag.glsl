#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vTexCoord;

// uniform vec2 u_resolution;
// uniform vec2 u_mouse;
uniform float u_time;

uniform sampler2D texture;
uniform float pNoise; 

float random (in vec2 _st) {
    return fract(sin(dot(_st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}

#define PI 3.14159265359

// Based on Morgan McGuire @morgan3d
// https://www.shadertoy.com/view/4dS3Wd
float noise (in vec2 _st) {
    vec2 i = floor(_st);
    vec2 f = fract(_st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

#define NUM_OCTAVES 5

float fbm ( in vec2 _st) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100.0);
    // Rotate to reduce axial bias
    mat2 rot = mat2(cos(0.5), sin(0.5),
                    -sin(0.5), cos(0.50));
    for (int i = 0; i < NUM_OCTAVES; ++i) {
        v += a * noise(_st);
        _st = rot * _st * 2.0 + shift;
        a *= 0.5;
    }
    return v;
}

void main() {
    vec2 st = vTexCoord;
    st.y = 1.-st.y;

    vec2 offset = vec2(pNoise * .1, .0);

    vec2 q = vec2(.0);
    q.x = fbm(st*1. + .1*u_time + vec2(533., 123.));
    q.y = fbm(st*1. + .1*u_time + vec2(12., 55.));

    // add vec2 offset & animate
    vec2 r = vec2(.0);
    r.x = fbm(st*1. + q*4. + .1*u_time + vec2(896., 123.));
    r.y = fbm(st*1. + q*4. + .1*u_time + vec2(89., 17.));

    vec2 f = vec2(.0);
    f.x = fbm(st+r.x*4.);
    f.y = fbm(st+r.y*4.);

    vec3 col = vec3(texture2D(texture, st));
    vec2 uvOffset = f*.2-.1;
    col.r = texture2D(texture, st + uvOffset + offset).r;
    col.g = texture2D(texture, st + uvOffset).g;
    col.b = texture2D(texture, st + uvOffset - offset).b;

    gl_FragColor = vec4(col, 1.0);
}