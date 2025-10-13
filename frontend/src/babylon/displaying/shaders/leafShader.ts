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
    
    // ===== MOUVEMENT CARACTÉRISTIQUE DES PALMIERS =====
    
    if (pos.y > 3.5) {
        // Pour les palmiers : distance du centre du tronc (base = 0, bout de la feuille = max)
        float distanceFromTrunk = length(vec2(pos.x, pos.z));
        
        // Facteur de flexibilité : le bout des feuilles bouge beaucoup plus que la base
        float flexibility = smoothstep(0.5, 3.0, distanceFromTrunk);
        
        // Facteur total de mouvement
        float movementFactor = flexibility;
        // Direction de la feuille depuis le centre
        vec2 leafDirection = normalize(vec2(pos.x, pos.z));
        
        // 1. BALANCEMENT PRINCIPAL - mouvement lent et ample (comme une vague)
        float mainSway = sin(time * 0.5 + pos.y * 0.3 + distanceFromTrunk * 0.2) * movementFactor;
        
        // 2. ONDULATION le long de la feuille (effet de vague progressive)
        float ripple = sin(time * 1.2 + distanceFromTrunk * 2.0) * flexibility * 0.3;
        
        // 3. FLOTTEMENT - mouvement circulaire lent
        float circleX = sin(time * 0.4) * cos(time * 0.3);
        float circleZ = cos(time * 0.4) * sin(time * 0.35);
        
        // 4. RAFALES - secousses rapides occasionnelles
        float gust = sin(time * 3.0 + pos.y) * cos(time * 2.5) * 0.2 * movementFactor;
        
        // Applique le mouvement dans la direction de la feuille
        pos.x += (mainSway + ripple + gust) * leafDirection.x * 0.4;
        pos.z += (mainSway + ripple + gust) * leafDirection.y * 0.4;
        
        // Mouvement circulaire
        pos.x += circleX * movementFactor * 0.15;
        pos.z += circleZ * movementFactor * 0.15;
        
        // 5. COURBURE VERTICALE - les feuilles s'abaissent légèrement avec le vent fort
        float droop = sin(time * 0.6 + distanceFromTrunk) * flexibility * 0.08;
        pos.y -= abs(droop);
        
        // 6. TWIST léger - rotation le long de la feuille
        float twistAngle = sin(time * 0.8 + distanceFromTrunk * 1.5) * flexibility * 0.1;
        float ct = cos(twistAngle);
        float st = sin(twistAngle);
        
        // Rotation autour de l'axe de la feuille
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
    
    // Convertir linéaire -> sRGB
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
    shader.onError = (_, e) => console.error("Shader error:", e);
    
    return shader;
};