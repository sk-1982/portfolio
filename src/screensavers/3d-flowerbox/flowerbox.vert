attribute vec3 a_vertexPosition;
attribute vec4 a_vertexNormal;
attribute vec4 a_vp;

uniform vec4 u_lightPosition;
uniform vec4 u_ambientProduct;
uniform vec4 u_diffuseProduct;
uniform vec4 u_specularProduct;
uniform float u_shininess;

uniform mat4 u_mvMatrix;
uniform mat4 u_projMatrix;

varying vec4 fColor;

void main() {
    vec3 eye = vec3(0.0, 0.0, 0.0);
    vec3 position = (u_mvMatrix * vec4(a_vertexPosition, 1.0)).xyz;
    vec3 light = u_lightPosition.xyz;
    vec3 L = normalize(light - position);
    vec3 E = normalize(eye - position);
    vec3 H = normalize(L + E);
    vec3 N = normalize((u_mvMatrix * a_vertexNormal).xyz);

    vec4 ambient = u_ambientProduct;

    float Kd = max(dot(L, N), 0.0);
    vec4 diffuse = Kd * u_diffuseProduct;

    float Ks = pow(max(dot(N, H), 0.0), u_shininess);
    vec4 specular = u_specularProduct * Ks;

    gl_Position = u_projMatrix * u_mvMatrix * vec4(a_vertexPosition, 1.0);

    fColor = ambient + diffuse + specular;
}
