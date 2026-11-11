struct VertexOutput {
    @builtin(position) position: vec4f,
    @location(0) tex_coord: vec2f,
}

struct EffectUniforms {
    resolution: vec2f,
    direction: vec2f,
    scalars: vec4f,
}

@group(0) @binding(0) var input_texture: texture_2d<f32>;
@group(0) @binding(1) var input_sampler: sampler;
@group(1) @binding(0) var<uniform> uniforms: EffectUniforms;

@fragment
fn fragment_main(input: VertexOutput) -> @location(0) vec4f {
    let source = textureSample(input_texture, input_sampler, input.tex_coord);
    if (source.a <= 0.00001) {
        return vec4f(0.0);
    }
    let temperature = uniforms.direction.x;
    var color = source.rgb * uniforms.scalars.x;
    color = color * vec3f(1.0 + temperature * 0.18, 1.0, 1.0 - temperature * 0.18);
    color = (color - vec3f(0.5)) * uniforms.scalars.y + vec3f(0.5);
    let luminance = dot(color, vec3f(0.2126, 0.7152, 0.0722));
    color = mix(vec3f(luminance), color, uniforms.scalars.z);
    let sepia = vec3f(
        dot(color, vec3f(0.393, 0.769, 0.189)),
        dot(color, vec3f(0.349, 0.686, 0.168)),
        dot(color, vec3f(0.272, 0.534, 0.131))
    );
    color = mix(color, sepia, uniforms.direction.y);
    let gray = dot(color, vec3f(0.2126, 0.7152, 0.0722));
    color = mix(color, vec3f(gray), uniforms.scalars.w);
    return vec4f(clamp(color, vec3f(0.0), vec3f(1.0)), source.a);
}
