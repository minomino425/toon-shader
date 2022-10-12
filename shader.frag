#define MAX_POINT_LIGHTS 1

uniform vec3 diffuse;
uniform float steps;
uniform float intensity;
varying vec3 vPos;
varying vec3 vNormal;
uniform vec3 pointLightColor[MAX_POINT_LIGHTS];
uniform vec3 pointLightPosition[MAX_POINT_LIGHTS];
uniform float pointLightDistance[MAX_POINT_LIGHTS];

void main() {
  vec3 n = normalize(vNormal);
  float i = intensity;
  for(int l = 0; l < MAX_POINT_LIGHTS; l++) {
    vec3 lightDirection = normalize(vPos - pointLightPosition[l]);
    i += dot(vec3(-lightDirection),n);
  }
  i = ceil(i * steps)/steps;
  gl_FragColor = vec4(diffuse, 1.0) + vec4(i);
}