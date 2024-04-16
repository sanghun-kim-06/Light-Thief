precision mediump float;

uniform vec2 resolution;

void main() {
    // 픽셀 좌표 (0.0, 0.0)부터 (1.0, 1.0)까지의 범위를 정규화합니다.
    vec2 uv = gl_FragCoord.xy / resolution.xy;

    // 황혼 효과를 만들기 위해 색상을 조절합니다.
    vec3 twilightColor = vec3(0.7, 0.5, 0.3); // 황혼 색상을 정의합니다.
    vec3 backgroundColor = mix(vec3(0.0), twilightColor, uv.y); // 황혼 색상을 배경 색상과 혼합합니다.

    // 쉐이더의 출력을 설정합니다.
    gl_FragColor = vec4(backgroundColor, 1.0);
}