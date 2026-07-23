import Particles from "@tsparticles/react";

function ParticlesBackground() {

    return (

        <Particles

            id="tsparticles"

            options={{

                background: {

                    color: "#0a0a0a"

                },

                fpsLimit: 60,

                particles: {

                    number: {

                        value: 80

                    },

                    color: {

                        value: "#ff0000"

                    },

                    size: {

                        value: { min: 2, max: 5 }

                    },

                    move: {

                        enable: true,

                        speed: 1,

                        direction: "bottom"

                    },

                    opacity: {

                        value: 0.6

                    }

                }

            }}

        />

    );

}

export default ParticlesBackground;