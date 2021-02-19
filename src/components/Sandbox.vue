<template lang="pug">
  .columns
    section.column.ui-section.is-narrow
      canvas#render.render(width="512" height="512" ref="canvas")

    section.column.ui-section
      label.label(for="code") Code
      .is-family-code async function (data, snapshot) {
      textarea#code.textarea.is-family-code(v-model="code" rows="15" spellcheck="false" autocapitalize="off")
      .is-family-code }

    section.column.ui-section.is-one-quarter
      b-field(label="Load preset")
        b-select(v-model="preset" placeholder="Select a preset" expanded)
          option(v-for="option in presets" :key="option.name" :value="option") {{ option.name }}
      b-field(label="Square of array size")
        b-input(v-model="dataSize" type="number" :min="2" :max="100" :disabled="running")
      b-field(label="Frame skip")
        b-input(v-model="frameSkip" type="number" :min="0" :max="1024" :disabled="running")
      .level.my-2
        .level-left
          .level-item.buttons
            b-button(v-on:click="shuffleData" :disabled="running") Shuffle
        .level-right
          .level-item
            b-button.button.is-primary(v-on:click="runAlgo" v-if="!running") Run
            b-button.button.is-danger(v-on:click="cancel" v-if="running") Stop

    b-modal(v-model="isDisplayingError" v-if="lastError" trap-focus has-modal-card :destroy-on-hide="false")
      .modal-card(style="width: auto")
        header.modal-card-head.dark-bg-pls
          h1.modal-card-title {{ lastError.type }}
        section.modal-card-body
          div An error has occurred while attempting to run your code:
          div.is-family-code.has-text-danger.my-2 {{ lastError.message }}
          div
            pre.is-family-code.stack-trace {{ lastError.stack }}
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

interface ErrorInfo {
  type: string
  message: string
  stack: string
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
      lastError: null as ErrorInfo | null,
      isDisplayingError: false,
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
        this.lastError = {
          type: "Code parsing error",
          message: e.message,
          stack: "Due to API limitations we can't tell what line/char contains the error"
        }
        this.isDisplayingError = true
        return
      }

      try {
        this.running = true
        this.runner = runner
        await runner.run(algo, this.data)
        this.renderNow()
      } catch (e) {
        console.error("Algorithm run-time error", e)
        this.lastError = {type: "Run-time error", message: e.message, stack: e.stack}
        this.isDisplayingError = true
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

.stack-trace {
  color: #aaa;
  background-color: #241f1d;
}

.dark-bg-pls {
  background-color: #241f1d;
}
</style>
