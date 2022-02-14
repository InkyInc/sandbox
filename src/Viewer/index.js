import React, { Component } from 'react';
import * as BABYLON from '@babylonjs/core';
import BabylonScene from '../BabylonScene'; // import the component above linking to file we just created.


const ybotURL = 'https://raw.githubusercontent.com/TheNosiriN/Babylon-Assets/master/ybot.babylon';
// const m4URL = 'https://raw.githubusercontent.com/TheNosiriN/Babylon-Assets/master/m4a1.obj';


var firstPerson = true;

//animations
var skeleton = null;

// var ak47 = null;

var idleAnim = null;
var walkAnim = null;
var runAnim = null;
var sprintAnim = null;
var jumpAnim = null;

//variables
var animationBlend = 0.005;
var mouseSensitivity = 0.005;
var cameraSpeed = 0.0075;
var walkSpeed = 0.008;
var runSpeed = 0.05;
var sprintSpeed = 0.008;
// var jumpSpeed = 0.0005;
var jumpHeight = 10;
var gravity = new BABYLON.Vector3(0, -0.0981, 0);

//in-game changed variables
var speed = 0;
var vsp = 0;
var jumped = false;
var mouseX = 0, mouseY = 0;
var mouseMin = -35, mouseMax = 45;




export default class Viewer extends Component {
    constructor() {
        super(...arguments);
        this.onSceneMount = (e) => {
            const { canvas, scene, engine } = e;

            // SETUP CAMERA

            // FREE CAMERA (NON MESH)
            var camera = new BABYLON.UniversalCamera("camera", new BABYLON.Vector3.Zero(), scene);
            camera.inputs.clear();
            camera.minZ = 0;


            // HEMLIGHT SETTINGS
            var hemLight = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
            hemLight.intensity = 0.2;
            hemLight.specular = BABYLON.Color3.Black();
            hemLight.groundColor = scene.clearColor.scale(0.75);

            // DIRECTIONAL LIGHT SETTINGS
            var dirLight = new BABYLON.DirectionalLight("dir01", new BABYLON.Vector3(0, -0.5, -1.0), scene);
            dirLight.position = new BABYLON.Vector3(0, 130, 130);

            // SHADOW GENERATION SETTINGS
            var shadowGenerator = new BABYLON.ShadowGenerator(3072, dirLight);
            shadowGenerator.usePercentageCloserFiltering = true;



            // ENV BUILDER SETTINGS 
            var helper = scene.createDefaultEnvironment({
                enableGroundShadow: true,
                enableGroundMirror: true,
                groundMirrorFallOffDistance: 0,
                groundSize: 100,
                skyboxSize: 100,
            });

            helper.setMainColor(scene.clearColor);
            helper.groundMaterial.diffuseTexture = null;
            helper.groundMaterial.alpha = 1;
            helper.groundMaterial.fogEnabled = true;

            // ADD SHAWDOWS TO CHARACTER
            var addShadows = function (mesh) {
                mesh.receiveShadows = true;
                shadowGenerator.addShadowCaster(mesh);
            }

            // ADD MIRROR TO CHARACTER
            var addToMirror = function (mesh) {
                helper.groundMirrorRenderList.push(mesh);
            }


            // INITIAL INPUTS CONTROL
            const dsm = new BABYLON.DeviceSourceManager(engine);
            var deltaTime = 10;

            // CHARACTER COMPONENTS
            var main = new BABYLON.Mesh("parent", scene);
            var target = new BABYLON.TransformNode();
            var character = new BABYLON.Mesh("character", scene);



            // CAMERA SETUP
            var firstPersonCamera = {
                middle: {
                    position: new BABYLON.Vector3(0, 1.75, 0.25),
                    fov: 1.25,
                    mouseMin: -45,
                    mouseMax: 45
                }
            };


            // var thirdPersonCamera = {
            //     middle: {
            //         position: new BABYLON.Vector3(0, 1.35, -5),
            //         fov: 0.8,
            //         mouseMin: -5,
            //         mouseMax: 45
            //     },
            //     leftRun: {
            //         position: new BABYLON.Vector3(0.7, 1.35, -4),
            //         fov: 0.8,
            //         mouseMin: -35,
            //         mouseMax: 45
            //     },
            //     rightRun: {
            //         position: new BABYLON.Vector3(-0.7, 1.35, -4),
            //         fov: 0.8,
            //         mouseMin: -35,
            //         mouseMax: 45
            //     },
            //     far: {
            //         position: new BABYLON.Vector3(0, 1.5, -6),
            //         fov: 1.5,
            //         mouseMin: -5,
            //         mouseMax: 45
            //     }
            // };

            // SWITCH FIRST TO THIRD PERSON VIEW [NEED IMPLEMENTS IF WANT TO CHANGE TO THIRD]
            function switchCamera(type) {
                camera.position = type.position.divide(camera.parent.scaling);
                camera.fov = type.fov;
                mouseMin = type.mouseMin;
                mouseMax = type.mouseMax;
            }


            var smallLight = new BABYLON.PointLight("boxLight", new BABYLON.Vector3.Zero(), scene);
            smallLight.diffuse = new BABYLON.Color3(0.3, 0.5, 0.8);
            smallLight.specular = smallLight.specular;
            smallLight.intensity = 1;
            smallLight.range = 5;


            //CHARACTER
            engine.displayLoadingUI();

            BABYLON.SceneLoader.ImportMesh("", "", ybotURL, scene, function (newMeshes, particleSystems, skeletons) {
                skeleton = skeletons[0];
                var body = newMeshes[1];
                var joints = newMeshes[0];
                body.scaling = new BABYLON.Vector3(0.01, 0.01, 0.01);
                body.rotation.y = BABYLON.Tools.ToRadians(180);
                joints.parent = body;
                body.parent = character;

                // BABYLON.SceneLoader.ImportMesh("", "", m4URL, scene, function (newMeshes) {
                //     var m4 = newMeshes[0];
                //     m4.scaling = new BABYLON.Vector3(3, 3, 3);
                //     m4.setPivotPoint(new BABYLON.Vector3(4.5, 0.5, -2), BABYLON.Space.Local);

                //     m4.detachFromBone();
                //     skeleton.prepare();
                //     m4.attachToBone(skeleton.bones[37], body);

                //     //m4.position = new BABYLON.Vector3(0.45, -0.05, -0.2).divide(body.scaling);
                //     m4.rotation = new BABYLON.Vector3(
                //         BABYLON.Tools.ToRadians(180),
                //         BABYLON.Tools.ToRadians(-90),
                //         BABYLON.Tools.ToRadians(90),
                //     );
                // });


                // SETUP MATERIAL/TEXTURE/ANIMATION FOR CHARACTER MODEL
                body.material = new BABYLON.StandardMaterial("character", scene);
                joints.material = new BABYLON.StandardMaterial("joints", scene);
                body.material.diffuseColor = new BABYLON.Color3(0.81, 0.24, 0.24);
                joints.material.emissiveColor = new BABYLON.Color3(0.19, 0.29, 0.44);


                addToMirror(character);
                addShadows(character);


                var idleRange = skeleton.getAnimationRange("None_Idle");
                var walkRange = skeleton.getAnimationRange("None_Walk");
                var runRange = skeleton.getAnimationRange("None_Run");
                var sprintRange = skeleton.getAnimationRange("None_Sprint");
                var jumpRange = skeleton.getAnimationRange("None_Jump");

                idleAnim = scene.beginWeightedAnimation(skeleton, idleRange.from + 1, idleRange.to, 1.0, true);
                walkAnim = scene.beginWeightedAnimation(skeleton, walkRange.from + 1, walkRange.to, 0, true);
                runAnim = scene.beginWeightedAnimation(skeleton, runRange.from + 1, runRange.to, 0, true);
                sprintAnim = scene.beginWeightedAnimation(skeleton, sprintRange.from + 1, sprintRange.to, 0, true);
                jumpAnim = scene.beginWeightedAnimation(skeleton, jumpRange.from + 10, jumpRange.to, 0, true);

                // COLLISION DETECTION
                main.ellipsoid = new BABYLON.Vector3(0.5, 0.9, 0.5);
                main.ellipsoidOffset = new BABYLON.Vector3(0, main.ellipsoid.y, 0);
                main.checkCollisions = true;
                //debug: drawEllipsoid(main);


                smallLight.parent = main;
                character.parent = main;
                target.parent = main;

                // SWITCH TO DETERMINE CAMERA POSITIONING
                if (firstPerson === true) {
                    camera.parent = character;
                    switchCamera(firstPersonCamera.middle);
                }
                // else {
                //     camera.parent = target;
                //     switchCamera(thirdPersonCamera.leftRun);
                // }

                main.position = new BABYLON.Vector3(10, 0, 10);


                engine.hideLoadingUI();
            }, function (evt) { });


            // SETUP KEYBINDS BEFORE SCENE LOADS
            scene.registerBeforeRender(function () {
                deltaTime = engine.getDeltaTime();

                updateCamera();

                if (character != null) {
                    var keyboard = dsm.getDeviceSource(BABYLON.DeviceType.Keyboard);
                    var mouse = dsm.getDeviceSource(BABYLON.DeviceType.Mouse);
                    if (keyboard) {
                        if (firstPerson === true) {
                            firstPersonMovement(
                                keyboard.getInput(87), //W
                                keyboard.getInput(83), //S
                                keyboard.getInput(65), //A
                                keyboard.getInput(68), //D
                                keyboard.getInput(32), //Space
                                keyboard.getInput(16), //Shift
                            );
                        } else {
                            thirdPersonMovement(
                                keyboard.getInput(87), //W
                                keyboard.getInput(83), //S
                                keyboard.getInput(65), //A
                                keyboard.getInput(68), //D
                                keyboard.getInput(32), //Space
                                keyboard.getInput(16), //Shift
                            );
                        }
                    }
                }
            });



            // KEYBOARD CONTROLS
            var mouseMove = function (e) {
                var movementX = e.movementX ||
                    e.mozMovementX ||
                    e.webkitMovementX ||
                    0;

                var movementY = e.movementY ||
                    e.mozMovementY ||
                    e.webkitMovementY ||
                    0;

                mouseX += movementX * mouseSensitivity * deltaTime;
                mouseY += movementY * mouseSensitivity * deltaTime;
                mouseY = clamp(mouseY, mouseMin, mouseMax);
            }


            // UPDATE CAMERA 
            function updateCamera() {
                target.rotation = lerp3(
                    target.rotation,
                    new BABYLON.Vector3(
                        BABYLON.Tools.ToRadians(mouseY),
                        BABYLON.Tools.ToRadians(mouseX), 0
                    ), cameraSpeed * deltaTime
                );
            }



            // THIRD PERSON MOVEMENT
            function thirdPersonMovement(up, down, left, right, jump, run) {
                var directionZ = up - down;
                var directionX = right - left;

                var vectorMove = new BABYLON.Vector3.Zero();
                var direction = Math.atan2(directionX, directionZ);

                var currentState = idleAnim;


                //move
                if (directionX !== 0 || directionZ !== 0) {
                    if (run !== 1) {
                        currentState = runAnim;
                        speed = lerp(speed, runSpeed, runAnim.weight);
                    } else {
                        currentState = sprintAnim;
                        speed = lerp(speed, sprintSpeed, sprintAnim.weight);
                    }

                    var rotation = (target.rotation.y + direction) % 360;
                    character.rotation.y = lerp(
                        character.rotation.y, rotation, 0.25
                    );

                    vectorMove = new BABYLON.Vector3(
                        (Math.sin(rotation)), 0,
                        (Math.cos(rotation))
                    );
                } else {
                    speed = lerp(speed, 0, 0.001);
                }


                //jump
                if (jump === 1 && jumped === false) {
                    jumped = true;
                }
                if (jumped === true) {
                    if (vsp < jumpHeight) {
                        vsp += jumpHeight * 10;
                    } else {
                        vsp += gravity.y / 10;
                        vsp = Math.min(vsp, gravity.y);
                        if (vsp === gravity.y) {
                            vsp = gravity.y;
                            jumped = false;
                        }
                    }
                    var rr = skeleton.getAnimationRange("None_Jump");
                    var a = scene.beginAnimation(skeleton, rr.from + 1, rr.to, false, 1, function () {
                        jumped = false; console.log("stopped " + rr.from + 1 + " " + rr.to);
                    });
                } else {
                    vsp = gravity.y;
                }


                var m = vectorMove.multiply(new BABYLON.Vector3().setAll(speed * deltaTime));
                main.moveWithCollisions(m.add(new BABYLON.Vector3(0, vsp, 0)));


                switchAnimation(currentState);
            }


            // FIRST PERSON MOVEMENT
            function firstPersonMovement(up, down, left, right, jump, run) {
                var directionZ = up - down;
                var directionX = right - left;

                var vectorMove = new BABYLON.Vector3.Zero();
                var direction = Math.atan2(directionX, directionZ);

                var currentState = idleAnim;


                if (directionX !== 0 || directionZ !== 0) {
                    if (up === 1) {
                        if (run !== 1) {
                            currentState = walkAnim;
                            speed = lerp(speed, walkSpeed, walkAnim.weight);
                        } else {
                            currentState = runAnim;
                            speed = lerp(speed, runSpeed, runAnim.weight);
                        }
                    } else {
                        // currentState = "walk";
                        // speed = lerp(speed, walkSpeed, walkAnim.weight);
                    }

                    vectorMove = new BABYLON.Vector3(
                        (Math.sin((target.rotation.y + direction) - BABYLON.Tools.ToRadians(180))), vsp,
                        (Math.cos((target.rotation.y + direction) - BABYLON.Tools.ToRadians(180)))
                    );
                }

                character.rotation.y = target.rotation.y - BABYLON.Tools.ToRadians(180);
                camera.rotation.x = target.rotation.x;


                if (jump > 0 && jumped === false) {
                    jumped = true;
                }
                if (jumped === true) {
                    if (vsp < jumpHeight) {
                        vsp += jumpHeight / 10;
                    } else {
                        vsp += gravity.y / 10;
                        vsp = Math.min(vsp, gravity.y);
                        if (vsp === gravity.y) {
                            vsp = gravity.y;
                            jumped = false;
                        }
                    }
                    var rr = skeleton.getAnimationRange("None_Jump");
                    var a = scene.beginAnimation(skeleton, rr.from + 1, rr.to, false, 1, function () {
                        jumped = false; console.log("stopped " + rr.from + 1 + " " + rr.to);
                    });
                } else {
                    vsp = gravity.y;
                }


                var m = vectorMove.multiply(new BABYLON.Vector3().setAll(speed * deltaTime));
                main.moveWithCollisions(m.add(gravity));

                switchAnimation(currentState);
            }


            // MOVEMENT OF CHARACTER
            function switchAnimation(anim) {
                var anims = [idleAnim, runAnim, walkAnim, sprintAnim];

                if (idleAnim !== undefined) {
                    for (var i = 0; i < anims.length; i++) {
                        if (anims[i] === anim) {
                            anims[i].weight += animationBlend * deltaTime;
                        } else {
                            anims[i].weight -= animationBlend * deltaTime;
                        }

                        anims[i].weight = clamp(anims[i].weight, 0.0, 1.0);
                    }
                }
            }




            //tools
            function clamp(value, min, max) {
                return (Math.max(Math.min(value, max), min));
            }

            function lerp(start, end, speed) {
                return (start + ((end - start) * speed));
            }

            function lerp3(p1, p2, t) {
                var x = lerp(p1.x, p2.x, t);
                var y = lerp(p1.y, p2.y, t);
                var z = lerp(p1.z, p2.z, t);

                return new BABYLON.Vector3(x, y, z);
            }




            //mouse lock
            // Configure all the pointer lock stuff
            function setupPointerLock() {
                // register the callback when a pointerlock event occurs
                document.addEventListener('pointerlockchange', changeCallback, false);
                document.addEventListener('mozpointerlockchange', changeCallback, false);
                document.addEventListener('webkitpointerlockchange', changeCallback, false);

                // when element is clicked, we're going to request a
                // pointerlock
                canvas.onclick = function () {
                    canvas.requestPointerLock =
                        canvas.requestPointerLock ||
                        canvas.mozRequestPointerLock ||
                        canvas.webkitRequestPointerLock
                        ;

                    // Ask the browser to lock the pointer)
                    canvas.requestPointerLock();
                };

            }


            // called when the pointer lock has changed. Here we check whether the
            // pointerlock was initiated on the element we want.
            function changeCallback(e) {
                if (document.pointerLockElement === canvas ||
                    document.mozPointerLockElement === canvas ||
                    document.webkitPointerLockElement === canvas
                ) {
                    // we've got a pointerlock for our element, add a mouselistener
                    document.addEventListener("mousemove", mouseMove, false);
                } else {
                    // pointer lock is no longer active, remove the callback
                    document.removeEventListener("mousemove", mouseMove, false);
                }
            };


            setupPointerLock();
            scene.detachControl();


            helper.ground.checkCollisions = true;
            helper.skybox.checkCollisions = true;


            // var gl = new BABYLON.GlowLayer("gl", scene);
            var pipeline = new BABYLON.DefaultRenderingPipeline(
                "pipeline", true, scene, [camera]
            );
            pipeline.samples = 4;
            var ssao = new BABYLON.SSAORenderingPipeline('ssaopipeline', scene, { ssaoRatio: 0.99, combineRatio: 1 }, [camera]);
            // var postProcess = new BABYLON.PostProcess("anamorphic effects", "anamorphicEffects", [], null, 1, camera);





            var startingPoint;
            var currentMesh;

            var getGroundPosition = function () {
                var pickinfo = scene.pick(scene.pointerX, scene.pointerY, function (mesh) { return mesh === ground; });
                if (pickinfo.hit) {
                    return pickinfo.pickedPoint;
                }

                return null;
            }

            var pointerDown = function (mesh) {
                currentMesh = mesh;
                startingPoint = getGroundPosition();
                if (startingPoint) { // we need to disconnect camera from canvas
                    setTimeout(function () {
                        camera.detachControl(canvas);
                    }, 0);
                }
            }

            var pointerUp = function () {
                if (startingPoint) {
                    camera.attachControl(canvas, true);
                    startingPoint = null;
                    return;
                }
            }

            var pointerMove = function () {
                if (!startingPoint) {
                    return;
                }
                var current = getGroundPosition();
                if (!current) {
                    return;
                }

                var diff = current.subtract(startingPoint);
                currentMesh.position.addInPlace(diff);

                startingPoint = current;

            }






            scene.onPointerObservable.add((pointerInfo) => {
                switch (pointerInfo.type) {
                    case BABYLON.PointerEventTypes.POINTERDOWN:
                        if (pointerInfo.pickInfo.hit && pointerInfo.pickInfo.pickedMesh !== ground) {
                            pointerDown(pointerInfo.pickInfo.pickedMesh)
                        }
                        break;
                    case BABYLON.PointerEventTypes.POINTERUP:
                        pointerUp();
                        break;
                    case BABYLON.PointerEventTypes.POINTERMOVE:
                        pointerMove();
                        break;
                }
            });



            const sphere = BABYLON.Mesh.CreateSphere("sphere1", 16, 2, scene);
            // Move the sphere upward 1/2 its height
            sphere.position.y = 1;
            // Our built-in 'ground' shape. Params: name, width, depth, subdivs, scene
            const ground = null;


            engine.runRenderLoop(() => {
                if (scene) {
                    scene.render();
                }
            });
        };
    }
    render() {
        return (
            React.createElement(BabylonScene, { onSceneMount: this.onSceneMount })
        );
    }
}