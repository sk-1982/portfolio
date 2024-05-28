
attribute  vec4 vPosition;
attribute  vec4 vColor;
attribute vec2 vTexCoord;

varying vec4 fColor;
varying vec2 fTexCoord;
varying mat4 fDrainMatrix;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 scaleMatrix;
uniform vec4 cameraPos;

uniform int lighting;

void main()
{
    gl_Position = projectionMatrix*modelViewMatrix*scaleMatrix*vPosition;
    fColor = vColor;
	fTexCoord = vTexCoord;
	float distance = distance(vPosition,cameraPos);
	float drain = (distance < 3.0) ? 1.0 : (3.0/distance - 0.2)/0.8;

	if(lighting==0) drain = 1.0;

	fDrainMatrix = mat4(	drain,  0.0,	0.0,	0.0,
		  		  			0.0,	drain,  0.0,	0.0,
		    				0.0,	0.0,	drain,	0.0,
		    				0.0,	0.0,	0.0,	1.0 );
}
