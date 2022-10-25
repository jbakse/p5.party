// some code adapted from:
// https://github.com/aferriss/p5jsShaderExamples

// useful reference
// https://itp-xstory.github.io/p5js-shaders/#/


#ifdef GL_ES
precision mediump float;
#endif

// grab texcoords from vert shader
varying vec2 vTexCoord;

// our texture coming from p5
uniform sampler2D tex0;
uniform vec2 resolution;
uniform float time;
uniform float shake;

void main() {
    vec2 uv = vTexCoord;
    // the texture is loaded upside down and backwards
    // by default so lets flip it
    uv.y = 1.0 - uv.y;

    // map shake from (0 to big) to (1 to small)
    // so we can multiply it by things and get nice results
    float tameShake = shake * .005 + 1.0;

    float tperiod = 4.0;
    float height = 50.0;
    float amount = .01;
    float vperioid = .5;
    float wacky = uv.x * (sin(time) * .3 + .1);
    float blip = mod(wacky + uv.y - time / tperiod, vperioid) * resolution.y / height;
    blip = clamp(blip, 0.0, 1.0);

    // uv.x += pow(sin(blip * 3.14), 150.0) * amount;

    vec2 uv1 = uv;
    vec2 uv2 = (uv - .5) * (1.005 * tameShake) + .5;
    vec2 uv3 = (uv - .5) / (1.005 * tameShake) + .5;
    uv2.x += pow(sin(blip * 3.14), 150.0) * amount;
    uv3.x -= pow(sin(blip * 3.14), 150.0) * amount;
    vec4 tex1 = texture2D(tex0, uv1);
    vec4 tex2 = texture2D(tex0, uv2);
    vec4 tex3 = texture2D(tex0, uv3);

    vec4 c;
    
    // visulize blip
    // c.r = blip;


    c.r = tex1.r;
    c.g = tex2.g;
    c.ba = tex3.ba;
  

    //   c.r = sin(time) * 0.5 + 0.5;


    // render the output
    gl_FragColor = vec4(c);

}