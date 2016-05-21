define(
[
  'Modules/Scene',
  'Environment/Constants',
  'Modules/RandomNumberGenerator',
  'Models/Asteroid'
],
function(Scene, Constants, RandomNumberGenerator, Asteroid) {
  'use strict';

  class AsteroidBeltFactory {
    constructor(scene, data) {
      this._scene = scene || null;
      this._count = data.asteroidBelt.count || 1000;
      this._distanceFromParent = data.asteroidBelt.distanceFromParent.min;
      this._distanceFromParentMin = data.asteroidBelt.distanceFromParent.min;
      this._distanceFromParentMax = data.asteroidBelt.distanceFromParent.max;
      this._distanceFromParentMedian = this.calculateDistanceFromParentMedian();
      this._texture = new THREE.TextureLoader().load('src/assets/textures/crust_tiny.jpg');
      this._randomNumberGenerator = new RandomNumberGenerator();
      this._orbitCentroid = new THREE.Object3D();
      this._orbitRadian = 360 / 1681.6;
      this._d2r = Constants.degreesToRadiansRatio;
    }

    build() {
      return new Promise((resolve, reject)=> {

        var particles = this._count;
        var geometry = new THREE.BufferGeometry();
        var positions = new Float32Array(particles * 3);
        var colors = new Float32Array(particles * 3);
        var color = new THREE.Color();
        var n = 1000;
        var n2 = n / 2; // particles spread in the cube

        for (var i = 0; i < positions.length; i += 3) {
          var pos = this.positionAsteroid(null, i);
          var x = pos.x;
          var y = pos.y;
          var z = pos.z;

          positions[i] = x;
          positions[i + 1] = y;
          positions[i + 2] = z;

          var rgbValue = this._randomNumberGenerator.getRandomArbitraryNumber(1, 20);
          color.setRGB(119, 81, 20);

          colors[i] = color.r;
          colors[i + 1] = color.g;
          colors[i + 2] = color.b;
        }

        geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.computeBoundingSphere();

        var material = new THREE.PointsMaterial({
          size: 15,
          map: this._texture
        });

        // var material = new THREE.MeshLambertMaterial({
        //   color: 0x61210B,
        //   // emissive: 0x61210B,
        //   vertexColors: THREE.VertexColors,
        //   fog: true
        // });

        var particleSystem = new THREE.Points(geometry, material);

        this._orbitCentroid.add(particleSystem);

        this._scene.add(this._orbitCentroid);

        document.addEventListener('frame', (e)=> {
          var degreesToRotate = 0.002;

          this._orbitCentroid.rotation.z +=  degreesToRotate * Constants.degreesToRadiansRatio;
        }, false);

        resolve();
      });
    }

    positionAsteroid(asteroid, count) {
      var odd = count % 2;
      var d = this._distanceFromParentMin * Constants.orbitScale;

      if (odd) {
        d = this._distanceFromParentMedian * Constants.orbitScale;
      }

      if (count % 3) {
        d = this._distanceFromParentMax * Constants.orbitScale;
      }

      d = d + (count / count.toFixed(0).length);

      // console.log('Distance: ',d);

      var randomNumber = this._randomNumberGenerator.getRandomNumberWithinRange(1, 4000) * (Math.random() + 1);
      var randomOffset = odd ? randomNumber * -1 : randomNumber;

      var amplitude = d + randomOffset * (2 + Math.random());
      var theta = count + 1 * Math.random() * this._orbitRadian * this._d2r;

      var posX = amplitude * Math.cos(theta);
      var posY = amplitude * Math.sin(theta);

      // console.debug('randomOffset', randomOffset);
      // console.debug('randomNumber', randomNumber);

      var posZ = this._randomNumberGenerator.getRandomArbitraryNumber(1, 900);

      return {
        x: posX,
        y: posY,
        z: odd ? posZ * -1 : posZ
      }
    }

    calculateDistanceFromParentMedian() {
      return Number.parseFloat((this._distanceFromParentMin + this._distanceFromParentMax) / 2);
    }
  }

  return AsteroidBeltFactory;
});
