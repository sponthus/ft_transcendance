// frontend/src/babylon/displaying/shaders/leafShader.ts
import * as BABYLON from "@babylonjs/core";

BABYLON.Effect.ShadersStore["leafVertexShader"] = `
precision highp float;

// Attributes
attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;

// Uniforms
uniform mat4 worldViewProjection;
uniform float time;

// Varyings
varying vec2 vUV;

void main(void) {
    vec3 pos = position;
    
    if (pos.y > 3.5) {
        float distanceFromTrunk = length(vec2(pos.x, pos.z));
        
        float flexibility = smoothstep(0.5, 3.0, distanceFromTrunk);
        
        float movementFactor = flexibility;
        vec2 leafDirection = normalize(vec2(pos.x, pos.z));
        
        float mainSway = sin(time * 0.5 + pos.y * 0.3 + distanceFromTrunk * 0.2) * movementFactor;
        
        float ripple = sin(time * 1.2 + distanceFromTrunk * 2.0) * flexibility * 0.3;
        
        float circleX = sin(time * 0.4) * cos(time * 0.3);
        float circleZ = cos(time * 0.4) * sin(time * 0.35);
    
        float gust = sin(time * 3.0 + pos.y) * cos(time * 2.5) * 0.2 * movementFactor;
        
        pos.x += (mainSway + ripple + gust) * leafDirection.x * 0.4;
        pos.z += (mainSway + ripple + gust) * leafDirection.y * 0.4;
        
        pos.x += circleX * movementFactor * 0.15;
        pos.z += circleZ * movementFactor * 0.15;
        
        float droop = sin(time * 0.6 + distanceFromTrunk) * flexibility * 0.08;
        pos.y -= abs(droop);
        
        float twistAngle = sin(time * 0.8 + distanceFromTrunk * 1.5) * flexibility * 0.1;
        float ct = cos(twistAngle);
        float st = sin(twistAngle);
        
        vec2 rotated = vec2(
            leafDirection.x * ct - leafDirection.y * st,
            leafDirection.x * st + leafDirection.y * ct
        );
        
        float offsetX = (rotated.x - leafDirection.x) * distanceFromTrunk * 0.3;
        float offsetZ = (rotated.y - leafDirection.y) * distanceFromTrunk * 0.3;
        
        pos.x += offsetX * movementFactor;
        pos.z += offsetZ * movementFactor;
    }
    
    vUV = uv;
    gl_Position = worldViewProjection * vec4(pos, 1.0);
}
`;

BABYLON.Effect.ShadersStore["leafFragmentShader"] = `
precision highp float;

varying vec2 vUV;
uniform sampler2D textureSampler;
uniform float alpha;

void main(void) {
    vec4 texColor = texture2D(textureSampler, vUV);
    
    texColor.rgb = pow(texColor.rgb, vec3(1.0/2.2));
    
    gl_FragColor = vec4(texColor.rgb, texColor.a * alpha);
}
`;

export const createLeafShader = (scene: BABYLON.Scene, leafTexture: BABYLON.Texture) => {
    const shader = new BABYLON.ShaderMaterial(
        "_leafShader",
        scene,
        { vertex: "leaf", fragment: "leaf" },
        {
            attributes: ["position", "normal", "uv"],
            uniforms: ["world", "worldViewProjection", "time"]
        }
    );
    
    shader.backFaceCulling = false;
    shader.setTexture("textureSampler", leafTexture);
    shader.setFloat("alpha", 1.0);
    
    return shader;
};