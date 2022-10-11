precision mediump float;

uniform mat4 invMatrix;
uniform vec3 lightDirection;
uniform sampler2D textures;
uniform vec4 edgeColor;
varying vec3 vNormal;
varying vec4 vColor;

void main() {
  if(edgeColor.a > 0.0) {
    gl_FragColor = edgeColor;
  } else {
    vec3 invLight = normalize(invMatrix * vec4(lightDirection, 0.0)).xyz;
    float diffuse = clamp(dot(vNormal, invLight), 0.0, 1.0);
    vec4 smpColor = texture2D(textures, vec2(diffuse, 0.0));
    gl_FragColor = vColor * smpColor;
  }
}