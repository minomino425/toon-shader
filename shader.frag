precision highp float;

uniform vec3 u_lightDirection;
// uniform vec3 u_globalColor;
uniform float u_gradient;
uniform bool u_isEdge;
varying vec3 vNormal;
varying vec3 vColor;

void main() {
    vec3 light = normalize(u_lightDirection);
    vec3 normal = normalize(vNormal);

    if(u_isEdge == true){
    vec3 rgb = vec3(0.0);
    gl_FragColor = vec4(rgb, 1.0);
    }

    if(u_isEdge == false){
        //法線の向きとベクトルの内積の結果から拡散光の計算する
        //単位化された内積の結果は、-1.0 ~ 1.0になるので、
        //(-1.0 ~ 1.0) * 0.5 + 0.5 == (0.0 ~ 1.0) の範囲に代わる
        float luminance = dot(light, normal) * 0.5 + 0.5;

        //情報の解像度を落とす
        // floor(0.4 * 3.0) / 3.0 = 0.333
        // floor(0.5 * 3.0) / 3.0 = 0.333
        // floor(0.6 * 3.0) / 3.0 = 0.333
        // floor(0.7 * 3.0) / 3.0 = 0.666
        // 一定の範囲内では計算結果が同じになり、つまり解像度が落ちた状態になる
        luminance = floor(luminance * u_gradient) / 4.0;
        vec3 rgb = vec3(vColor * luminance);
        gl_FragColor = vec4(rgb, 1.0);
    }
}