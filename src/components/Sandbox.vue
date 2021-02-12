<template>
  <div class="columns">
    <section class="column ui-section is-narrow">
      <canvas id="render" width="512" height="512" ref="canvas" class="render"></canvas>
    </section>
    <section class="column ui-section">
      <b-field label="Code">
        <b-input type="textarea" rows="15" v-model="code" spellcheck="false" autocapitalize="off"
                 custom-class="is-family-code" id="code"></b-input>
      </b-field>
      <div class="is-family-code">}</div>
    </section>
    <section class="column ui-section is-one-quarter">
      <b-field label="Load preset">
        <b-select placeholder="Select a preset" expanded v-model="preset">
          <option v-for="option in presets" :key="option.name" :value="option">
            {{ option.name }}
          </option>
        </b-select>
      </b-field>
      <b-field label="Square of array size">
        <b-input type="number" :min="2" :max="100" v-model="dataSize" :disabled="running"></b-input>
      </b-field>
      <b-field label="Frame skip">
        <b-input type="number" :min="0" :max="1000" v-model="frameSkip" :disabled="running"></b-input>
      </b-field>
      <div class="level my-2">
        <div class="level-left">
          <div class="level-item buttons">
            <b-button v-on:click="shuffleData" :disabled="running">Shuffle</b-button>
          </div>
        </div>
        <div class="level-right">
          <div class="level-item">
            <b-button v-on:click="runAlgo" v-if="!running" class="button is-primary">Run</b-button>
            <b-button v-on:click="cancel" v-if="running" class="button is-danger">Stop</b-button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {CanvasRenderer, Renderer, RenderingSnapshooter} from "@/lib/render"
import {AlgorithmFunction, DefaultRunner, parseAlgorithmCode, Runner} from "@/lib/runner"
import {shuffleArray} from "@/lib/util";
import {presets, VisualizerPreset} from "@/lib/presets";


const buildDataArray = (side: number): number[] => {
  const size = side * side
  const data = []

  for (let i = 0; i < size; i++) {
    data.push(i)
  }

  return data
}

const defaultDataSize = 32;
const defaultFrameSkip = 1;

export default Vue.extend({
  name: 'HelloWorld',
  props: {
    msg: String
  },
  data() {
    const data = buildDataArray(defaultDataSize)

    return {
      code: "",
      dataSize: defaultDataSize,
      frameSkip: defaultFrameSkip,
      running: false,
      runner: null as Runner | null,
      renderer: null as Renderer | null,
      preset: null as VisualizerPreset | null,
      presets,
      data
    }
  },
  mounted() {
    this.renderer = new CanvasRenderer(<HTMLCanvasElement>this.$refs.canvas)
    this.shuffleData()
    this.renderNow()
  },
  methods: {
    async runAlgo() {
      const snapshooter = new RenderingSnapshooter(this.renderer!, this.frameSkip)
      const runner = new DefaultRunner(snapshooter)

      let algo: AlgorithmFunction
      try {
        algo = parseAlgorithmCode(this.code)
      } catch (e) {
        console.error("Code parse error", e)
        return
      }

      try {
        this.running = true
        this.runner = runner
        await runner.run(algo, this.data)
        this.renderNow()
      } catch (e) {
        console.error("Algorithm run-time error", e)
      } finally {
        this.runner = null
        this.running = false
      }
    },
    cancel() {
      return this.runner?.cancel?.()
    },
    resetData() {
      this.data = buildDataArray(this.dataSize)
      shuffleArray(this.data)
      this.renderNow()
    },
    shuffleData() {
      shuffleArray(this.data)
      this.renderNow()
    },
    renderNow() {
      this.renderer?.renderNow(this.data)
    }
  },
  watch: {
    dataSize() {
      this.preset = null
      this.resetData()
    },
    frameSkip() {
      console.log("yolo")
      this.preset = null
    },
    code() {
      this.preset = null
    },
    preset() {
      if (this.preset) {
        this.dataSize = this.preset.size
        this.frameSkip = this.preset.skip
        this.code = this.preset.code
        this.resetData()
      }
    }
  }
})
</script>

<style scoped>
.ui-section {
  padding: 1rem 1rem 0;
}

.render {
  display: block;
  max-width: 100%;
}

.controls-buttons {
  padding: 2ex 0;
}
</style>
