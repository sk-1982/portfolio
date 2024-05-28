precision mediump float;

uniform int i;

varying vec4 fColor;
varying vec2 fTexCoord;
varying mat4 fDrainMatrix;

uniform sampler2D floor;
uniform sampler2D wall;
uniform sampler2D ceiling;
uniform sampler2D pic;
uniform sampler2D start;
uniform sampler2D fin;
uniform sampler2D open;
uniform sampler2D rat;

void main()
{

    if(i==1) gl_FragColor = fDrainMatrix*texture2D(floor, fTexCoord);
    else if(i==2) gl_FragColor = fDrainMatrix*texture2D(ceiling, fTexCoord);
    else if(i==3) gl_FragColor = fDrainMatrix*texture2D(pic, fTexCoord);
    else if(i==4) gl_FragColor = vec4(texture2D(start, fTexCoord).rgb,texture2D(start, fTexCoord).a*.5);
    else if(i==5) gl_FragColor = vec4(texture2D(fin, fTexCoord).rgb,texture2D(fin, fTexCoord).a*.5);
    else if(i==6) gl_FragColor = vec4(texture2D(open, fTexCoord).rgb,texture2D(open, fTexCoord).a*.5);
    else if(i==7) gl_FragColor = texture2D(rat, fTexCoord);
    else if(i==8) gl_FragColor = fColor;
	else gl_FragColor = fDrainMatrix*texture2D(wall, fTexCoord);
}
