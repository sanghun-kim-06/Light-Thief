let points;
let font;
let spacing = 30;
let minMouseDist = 5000;
let txt = "Light : Thief";

var gl, noctaves, c; // WebGL 컨텍스트, 옥타브 수, c 배열 선언

var fSize // font size
var msg // text to write
var pts = [] // store path data
var path
let distortionFactor = 10; // 마우스 인터랙션에 따른 변형 강도 조절

let myText = 'Light:Thief';
let myFont1;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL); // 웹글 컨텍스트를 이용해 캔버스 생성
  gl = this._renderer.GL;
  gl.disable(gl.DEPTH_TEST);

  noctaves = 4; // 옥타브 수 초기화
  c = []; // c 배열 초기화
  initc(); // c 배열을 초기화하는 함수 호출

  test = new p5.Shader(this._renderer, vert, frag); // p5.js 쉐이더 생성
  shader(test); // 생성한 쉐이더를 현재 쉐이더로 설정
  textFont(font);
  textSize(57);


  textAlign(LEFT);
  
  points = new Array(txt.length);
  for (let i = 0; i < points.length; i++){
		points[i] = new Array(2);
  }
  
  let textW = textWidth(txt);
  let s2 = " ";
    
  for(var i = 0; i < txt.length; i++){
    let charPosn = textWidth(s2);
    
    points[i][0] = createVector((width - textW) / 2 + textWidth(s2), height / 2);
    
    s2 = s2 + txt.charAt(i);
    
    console.log("s2: " + s2);
  }

 
}

function preload() {
  font = loadFont("heirof-light-bold.ttf");
}

function draw() {
  
  push();
  test.setUniform("iResolution", [width, height]); // 쉐이더에 해상도 정보 전달
  test.setUniform("iTime", millis() * 0.009); // 쉐이더에 시간 정보 전달
  test.setUniform('iMouse', [mouseX * 1.5, mouseY * 1.5]); // 쉐이더에 마우스 위치 정보 전달
  test.setUniform("noctaves", noctaves); // 쉐이더에 옥타브 수 정보 전달
  test.setUniform("c", c); // 쉐이더에 c 배열 정보 전달
  shader(test); // 쉐이더 적용
  box(width, height); // 캔버스 중심에 크기가 width인 상자 그리기
  resetShader();
  pop();

  
  push();
  translate(-width / 2,-height/2);

  for(let i = 0; i < points.length; i++){
    let p = points[i][0];
    let p2 = createVector(0, 0);
    let mouseDist = dist(p.x, p.y, mouseX, mouseY);

    if(mouseDist < minMouseDist){
      p2 = createVector(p.x - mouseX, p.y - mouseY);   
      
      let distDifference = minMouseDist - mouseDist;
      p2.setMag(sqrt(distDifference));
    }

    points[i][1] = p2;

    text(txt.charAt(i), p.x + p2.x, p.y + p2.y);
  }


	textSize(20);
  textAlign(RIGHT);
  if(windowWidth > 1000) {
    text(': 빛을 훔쳐서, 부끄러운 상상을 조명하다.',width/1.8 , height/1.9);
  } else{
    text(': 도둑맞은 빛으로부터 상상을 되찾다',width/1.4 , height/2);
  }
  
  pop();
}
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  points = new Array(txt.length);
  for (let i = 0; i < points.length; i++){
		points[i] = new Array(2);
  }
  
  let textW = textWidth(txt);
  let s2 = " ";
    
  for(var i = 0; i < txt.length; i++){
    let charPosn = textWidth(s2);
    
    points[i][0] = createVector((width - textW) / 2 + textWidth(s2), height / 2);
    
    s2 = s2 + txt.charAt(i);
    
    console.log("s2: " + s2);
  }
}

var frag = `
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 iResolution;
uniform vec2 iMouse;
uniform float iTime;
uniform int noctaves;
uniform float c[22];
float mousefactor;

float noise( in vec2 x )
{
	return sin(1.5*x.x)*sin(1.5*x.y);
}

const mat2 rot = mat2( 0.80,  0.6, -0.6,  0.8 );
float fbm ( in vec2 _st) {
    float v = 0.0;
    float a = 0.6;
    vec2 shift = 10.0*vec2(c[11],c[12]);
    for (int i = 0; i < 12; ++i) {//noprotect
		if(i>=noctaves)break;
        v += a * noise(_st);
        _st = rot*_st* 2.0 + shift;
        a *= 0.5;
    }
    return v;
}

void main() {
		vec2 mouse=iMouse/iResolution;
    vec2 st =(-iResolution.xy+2.0*gl_FragCoord.xy)/iResolution.y;//(gl_FragCoord.xy/iResolution.xy);//
    vec3 color = vec3(0.);
    vec2 q = vec2(0.);
    q.x = fbm( st+vec2(c[0],c[1]*.01*iTime) );
    q.y = fbm( st+vec2(c[2],c[3]) );
    vec2 r = vec2(0.);

//play with the values here!
		r.x = fbm( st+ (0.10*mouse.x+0.2)*q+vec2(c[5],c[6]));
    r.y = fbm( st+ (2.0*mouse.y+0.5)*q*sin(.01*iTime)+vec2(c[8]*.05*iTime,c[9]));
    float f = fbm(st+c[10]*(r+length(q) ));
    color = smoothstep(vec3(0.1,0.1,0.6),vec3(0.1,0.1,0.1),color);
    color = mix(color,vec3(1.856,.05*(1.0+cos(1.5+.2*iTime)),0.164706),r.y+length(q));//
    color = mix(color,vec3(1.5*sin(.1*iTime),0.0,cos(.13*iTime)),length(r+q));//.2+.2*(1.0+cos(0.5+.3*iTime))
		color = mix( color, vec3(0.9,0.9,0.9), dot(r,r) );
		color*=(1.5*f*f*f+1.8*f*f+1.7*f);
		color+=.4*vec3(1.8+r.x,0.7+q);
		color=pow(color, vec3(.5));
//

    gl_FragColor = vec4(color,1.);
}
`;

var vert = `
#ifdef GL_ES
      precision highp float;
    #endif
    #extension GL_OES_standard_derivatives : enable
    // attributes, in
    attribute vec3 aPosition;
    attribute vec3 aNormal;
    attribute vec2 aTexCoord;
    attribute vec4 aVertexColor;

    // attributes, out
    varying vec3 var_vertPos;
    varying vec4 var_vertCol;
    varying vec3 var_vertNormal;
    varying vec2 var_vertTexCoord;
    
    // matrices
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    uniform mat3 uNormalMatrix;

    void main() {
      gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);

      // just passing things through
      var_vertPos      = aPosition;
      var_vertCol      = aVertexColor;
      var_vertNormal   = aNormal;
      var_vertTexCoord = aTexCoord;
    }
`;

function initc() {
  for (var i = 0; i < 22; i++) {
    c[i] = random(-5, 5); // c 배열에 -5에서 5 사이의 랜덤 값을 채움
  }
}