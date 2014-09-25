function FloatRasterReader(raster, bin_count) {	
	
	this.raster = raster;
	this.bin_count=bin_count;
	this.name = name;
    /*Initialise offscreen buffer*/
		
	this.floatProgram = utils.loadShaders("float_vShader",  "float_fShader", this);
	var framebuffer = gl.createFramebuffer();	
	framebuffer.name = "float framBuffer";
	var renderbuffer = gl.createRenderbuffer();
	
	this.floatTexture = gl.createTexture();
	this.floatTexture.name = "float texture";
	
	/** Framebuffer */
	gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

	/** Texture*/
	gl.bindTexture(gl.TEXTURE_2D, this.floatTexture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); 
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.bin_count,
		1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
		
		
	/** Render buffer*/
	gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
	gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16,
			this.bin_count, 1);

	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
			gl.TEXTURE_2D, this.floatTexture, 0);
	gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT,
			gl.RENDERBUFFER, renderbuffer);
		
	
	/**create vertex buffer*/		
	this.buffer = gl.createBuffer();
	this.buffer.name="ras_vert";
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    
    
    this.vertices = new Float32Array(this.bin_count*2);	
    
    for (var i = 0; i <= (this.vertices.length); i=i+2) {		  	
    	this.vertices[i] = i/this.vertices.length+1/this.vertices.length;
    	this.vertices[i+1] = 0.5; 
		}		
    
    
    this.buffer.itemSize =2;
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
    
		
	gl.bindRenderbuffer(gl.RENDERBUFFER, null);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.bindTexture(gl.TEXTURE_2D, null);		
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
	/** this goes before every rendering **/
    
	this.setup = function() {
		//gl.useProgram(this.glProgram);
		gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
		
		this.enableBuffer(this.buffer);
		gl.viewport(0, 0, this.bin_count, 1);				
		gl.clearColor(0.0, 0.0, 0.0, 0.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
		gl.disable(gl.DEPTH_TEST);
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.ONE, gl.ONE);
	   
		

		

	}

	this.enableBuffer = function(buffer){
		
		name = buffer.name;
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		
		if (gl.getAttribLocation(this.floatProgram , name)>=0){
		loc = gl.getAttribLocation(this.floatProgram , name);		
        gl.enableVertexAttribArray(loc);
		gl.vertexAttribPointer(loc,  buffer.itemSize, gl.FLOAT, false, 0, 0);	
		} else {
			console.log("Error: attribute "+name+" does not exist.");
		}
	
}
	this.setUniforms = function(){				
		
		
		
		
	}
	
	
	
	this.render = function(){	
	
		gl.useProgram(this.floatProgram);
		//gl.bindTexture(gl.TEXTURE_2D, this.floatTexture);
		gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
		
		
		var rasterLoc =  gl.getUniformLocation(this.floatProgram, 'floatRaster'); 		 
		gl.uniform1i(rasterLoc , 0);		   
		gl.activeTexture(gl.TEXTURE0);		
		gl.bindTexture(gl.TEXTURE_2D, this.raster);
				
		
		gl.disable(gl.BLEND);
		gl.disable(gl.DEPTH_TEST);
		
			
		gl.drawArrays(gl.POINTS, 0, this.bin_count);		
		
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.bindTexture(gl.TEXTURE_2D, null);
		
	}
	

	
	this.readPixels = function() {
		
		console.time("reading filter");
		
		gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
		var readout_eight = new Uint8Array(this.bin_count * 4);
		gl.readPixels(0, 0, this.bin_count, 1, gl.RGBA, gl.UNSIGNED_BYTE, readout_eight);		

		var readout = new Float32Array(readout_eight.buffer);
		sum = 0;
		for (i = 0; i < readout.length; i++) {
			sum = sum + readout[i];
		}
		console.log(sum);
		console.log(readout);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	}
	
	
}

create2DTexture = function() {
    var data = new Uint8Array(10*10*4);
    kk=0;
	for (o = 0 ; o<10 ; o++){
		for (p = 0 ; p<10 ; p++){
			data[kk++]=20*p;
			data[kk++]=25;
			data[kk++]=50;
			data[kk++]=255;
		
		}
	
	}
   
    var texture = gl.createTexture();		
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 10, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); //gl.NEAREST is also allowed, instead of gl.LINEAR, as neither mipmap.
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); //Prevents s-coordinate wrapping (repeating).
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	
	gl.bindTexture(gl.TEXTURE_2D, null);
  
	return texture;
   

	
}

