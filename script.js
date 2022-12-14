// 必要なモジュールを読み込み
import * as THREE from "../lib/three.module.js";
import { OrbitControls } from "../lib/OrbitControls.js";

import { GUI } from "https://unpkg.com/three@0.127.0/examples/jsm/libs/dat.gui.module.js";

// const gui = new GUI({ width: 300 });
// gui.open();

// DOM がパースされたことを検出するイベントで App3 クラスをインスタンス化する
window.addEventListener(
  "DOMContentLoaded",
  () => {
    const app = new App3();
    // app.load().then(() => {
    app.init();
    app.render();
    // });
  },
  false
);

/**
 * three.js を効率よく扱うために自家製の制御クラスを定義
 */
class App3 {
  /**
   * カメラ定義のための定数
   */
  static get CAMERA_PARAM() {
    return {
      fovy: 45,
      aspect: window.innerWidth / window.innerHeight,
      near: 1,
      far: 300.0,
      x: 2.0,
      y: 0.0,
      z: 0.0,
      // lookAt: new THREE.Vector3(0.0, 0.0, 0.0),
    };
  }
  /**
   * レンダラー定義のための定数
   */
  static get RENDERER_PARAM() {
    return {
      clearColor: 0xe97f8c,
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }
  /**
   * ディレクショナルライト定義のための定数
   */
  static get DIRECTIONAL_LIGHT_PARAM() {
    return {
      color: 0xffffff, // 光の色
      intensity: 1.0, // 光の強度
      x: 1.0, // 光の向きを表すベクトルの X 要素
      y: 1.0, // 光の向きを表すベクトルの Y 要素
      z: 1.0, // 光の向きを表すベクトルの Z 要素
    };
  }
  /**
   * アンビエントライト定義のための定数
   */
  static get AMBIENT_LIGHT_PARAM() {
    return {
      color: 0xffffff, // 光の色
      intensity: 0.1, // 光の強度
    };
  }
  /**
   * マテリアル定義のための定数 @@@
   * 参考: https://threejs.org/docs/#api/en/materials/Material
   */
  static get MATERIAL_PARAM() {
    return {
      color: 0xa9ceec,
      opacity: 0.7, // 透明度
      side: THREE.DoubleSide, // 描画する面（カリングの設定）
    };
  }
  static get MATERIAL_PARAM_RED() {
    return {
      color: 0xff3333,
      opacity: 0.7, // 透明度
      side: THREE.DoubleSide, // 描画する面（カリングの設定）
    };
  }
  static get MATERIAL_PARAM_GREEN() {
    return {
      color: 0x33ff99,
      opacity: 0.7, // 透明度
      side: THREE.DoubleSide, // 描画する面（カリングの設定）
    };
  }
  static get MATERIAL_PARAM_YELLOW() {
    return {
      color: 0xffff33,
      opacity: 0.7, // 透明度
      side: THREE.DoubleSide, // 描画する面（カリングの設定）
    };
  }

  /**
   * コンストラクタ
   * @constructor
   */
  constructor() {
    this.renderer; // レンダラ
    this.scene; // シーン
    this.camera; // カメラ
    this.directionalLight; // ディレクショナルライト
    this.ambientLight; // アンビエントライト
    this.texture = []; // テクスチャ
    this.geometry;
    this.planeArray = [];
    this.materialArray = [];
    this.material;
    this.mesh;
    this.meshArray = [];
    this.getViewSizeAtDepth = (depth = 0) => {
      const fovInRadians = (this.camera.fov * Math.PI) / 180;
      const height = Math.abs(
        (this.camera.position.z - depth) * Math.tan(fovInRadians / 2) * 2
      );
      return { width: height * this.camera.aspect, height };
    };
    this.uniforms;

    // 再帰呼び出しのための this 固定
    this.render = this.render.bind(this);

    // リサイズイベント
    window.addEventListener(
      "resize",
      () => {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
      },
      false
    );
  }

  /**
   * アセット（素材）のロードを行う Promise
   */
  // load() {
  //   const imagePath = ["./01.jpg", "./01.jpg", "./03.jpg"];

  //   return new Promise((resolve) => {
  //     const loader = new THREE.TextureLoader();
  //     imagePath.forEach((img) => {
  //       loader.load(img, (texture) => {
  //         this.texture.push(texture);
  //         //テクスチャが画像の枚数と一致していれば解決
  //         this.texture.length === imagePath.length ? resolve() : "";
  //       });
  //     });
  //   });
  // }

  /**
   * 初期化処理
   */
  init() {
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setClearColor(
      new THREE.Color(App3.RENDERER_PARAM.clearColor)
    );
    this.renderer.setSize(
      App3.RENDERER_PARAM.width,
      App3.RENDERER_PARAM.height
    );
    const wrapper = document.querySelector("#webgl");
    wrapper.appendChild(this.renderer.domElement);

    // シーン
    this.scene = new THREE.Scene();

    // カメラ
    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.001,
      1000
    );
    this.camera.position.set(0, 0, -5);
    // this.camera.lookAt(App3.CAMERA_PARAM.lookAt);

    // const gui = new GUI();
    // const cameraFolder = gui.addFolder("Camera");
    // cameraFolder.add(this.camera.position, "z", 0, 10);
    // cameraFolder.open();

    function loadFile(url, data) {
      var request = new XMLHttpRequest();
      request.open("GET", url, false);

      request.send(null);

      // リクエストが完了したとき
      if (request.readyState == 4) {
        // Http status 200 (成功)
        if (request.status == 200) {
          return request.responseText;
        } else {
          // 失敗
          console.log("error");
          return null;
        }
      }
    }

    

    // ランダムな色取得
    function _getRandomColor() {
      const r = ~~(Math.random() * 255);
      const g = ~~(Math.random() * 255);
      const b = ~~(Math.random() * 255);
      return "rgb(" + r + ", " + g + ", " + b + ", 0.5 )";
    }

    // for (let i = 0; i < 3; i++) {
    //   this.materialArray.push(this.material);
    //   this.mesh = new THREE.Mesh(this.geometry, this.materialArray[i]);
    //   this.mesh.position.x = i;
    //   this.planeArray.push(this.mesh);
    //   this.scene.add(this.planeArray[i]);
    // }

    // 共通のジオメトリ、マテリアルから、複数のメッシュインスタンスを作成する @@@
    const COUNT = 20;
    const TRANSFORM_SCALE = 2.0;
    this.geometry = new THREE.TorusGeometry(0.2, 0.1, 1000, 1000);

    // this.meshArray = [];
    for (let i = 0; i < COUNT; ++i) {
      this.uniforms = THREE.UniformsUtils.merge([
        THREE.UniformsLib["lights"],
        {
          diffuse: {
            type: "c",
            value: new THREE.Color(_getRandomColor()),
          },
          steps: {
            type: "f",
            value: 1,
          },
          intensity: {
            type: "f",
            value: 0.5,
          },
        },
      ]);

      this.material = new THREE.ShaderMaterial({
        vertexShader: loadFile("./shader.vert"),
        fragmentShader: loadFile("./shader.frag"),
        uniforms: this.uniforms,
        side: THREE.DoubleSide,
      });

      // トーラスメッシュのインスタンスを生成
      const stars = new THREE.Mesh(this.geometry, this.material);
      // 座標をランダムに散らす
      stars.position.x = (Math.random() * 2.0 - 1.0) * TRANSFORM_SCALE;
      stars.position.y = (Math.random() * 2.0 - 1.0) * TRANSFORM_SCALE;
      stars.position.z = (Math.random() * 2.0 - 1.0) * TRANSFORM_SCALE;
      // シーンに追加する
      this.scene.add(stars);
      // 配列に入れておく
      this.meshArray.push(stars);
    }

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
  }

  /**
   * 描画処理
   */
  render() {
    // 恒常ループ
    requestAnimationFrame(this.render);
    // レンダラーで描画
    this.renderer.render(this.scene, this.camera);
    for (let i = 0; i < this.meshArray.length; i++) {
      this.meshArray[i].rotation.x += Math.random() * 0.05;
      this.meshArray[i].rotation.y += Math.random() * 0.1;
    }
  }
}
