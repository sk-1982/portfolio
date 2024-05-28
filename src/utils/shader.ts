export const initShaders = (gl: WebGLRenderingContext, vertexShader: string, fragmentShader: string) => {
	const vertShader = gl.createShader(gl.VERTEX_SHADER);
	if (!vertShader)
		throw new Error('Failed to create vertex shader');
	gl.shaderSource(vertShader, vertexShader);
	gl.compileShader(vertShader);

	if (!gl.getShaderParameter(vertShader, gl.COMPILE_STATUS))
		throw new Error('Failed to compile vertex shader: ' + gl.getShaderInfoLog(vertShader));

	const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
	if (!fragShader)
		throw new Error('Failed to create fragment shader');
	gl.shaderSource(fragShader, fragmentShader);
	gl.compileShader(fragShader);

	if (!gl.getShaderParameter(fragShader, gl.COMPILE_STATUS))
		throw new Error('Failed to compile fragment shader: ' + gl.getShaderInfoLog(fragShader));

	const program = gl.createProgram();
	if (!program)
		throw new Error('Failed to create program');
	gl.attachShader(program, vertShader);
	gl.attachShader(program, fragShader);
	gl.linkProgram(program);

	if (!gl.getProgramParameter(program, gl.LINK_STATUS))
		throw new Error('Failed to link program');

	return program;
};
