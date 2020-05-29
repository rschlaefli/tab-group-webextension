import { createSlice, createAsyncThunk, createAction } from '@reduxjs/toolkit'
import { AppDispatch } from '@src/background'
import { RootState } from './configureStore'
import { toggleHeuristicsBackend } from './settings'
import { getBrowserSafe } from '@src/lib/utils'

const tutorialSlice = createSlice({
  name: 'tutorial',
  initialState: {
    progress: 0,
    heuristicsRequirementsSatisfied: false,
    heuristicsSetupCompleted: false,
    heuristicsConnectionEstablished: false,
    heuristicsConnectionError: null,
  },
  reducers: {
    resetProgress(state): void {
      state.progress = 0
      state.heuristicsRequirementsSatisfied = false
      state.heuristicsSetupCompleted = false
      state.heuristicsConnectionEstablished = false
      state.heuristicsConnectionError = null
    },
    updateProgress(state, action): void {
      state.progress = action.payload
    },
    updateHeuristicsInstallationStep(state, action): void {
      const { heuristicsRequirementsSatisfied, heuristicsSetupCompleted } = action.payload
      if (typeof heuristicsRequirementsSatisfied !== 'undefined') {
        state.heuristicsRequirementsSatisfied = heuristicsRequirementsSatisfied
      }
      if (typeof heuristicsSetupCompleted !== 'undefined') {
        state.heuristicsSetupCompleted = heuristicsSetupCompleted
      }
    },
    updateHeuristicsConnectionEstablished(state, action): void {
      if (action.payload.success) {
        state.heuristicsConnectionEstablished = true
        state.heuristicsConnectionError = null
      } else {
        state.heuristicsConnectionEstablished = false
        state.heuristicsConnectionError = action.payload.error
      }
    },
  },
})

const { actions, reducer } = tutorialSlice
export const {
  resetProgress,
  updateProgress,
  updateHeuristicsInstallationStep,
  updateHeuristicsConnectionEstablished,
} = actions
export default reducer

export const establishHeuristicsConnection = createAsyncThunk<
  void,
  void,
  { dispatch: AppDispatch; state: RootState }
>(
  'tutorial/establishHeuristicsConnection',
  async (_, thunkAPI): Promise<void> => {
    const state = thunkAPI.getState()
    if (!state.settings.isHeuristicsBackendEnabled) {
      thunkAPI.dispatch(toggleHeuristicsBackend() as any)
    }
    try {
      const browser = await getBrowserSafe()
      await browser.runtime.sendNativeMessage('tabs', { action: 'PING' })
      thunkAPI.dispatch(updateHeuristicsConnectionEstablished({ success: true }))
    } catch (e) {
      console.error(e)
      thunkAPI.dispatch(updateHeuristicsConnectionEstablished({ error: e.message }))
    }
  }
)

export const establishHeuristicsConnectionAlias = createAction(
  'tutorial/establishHeuristicsConnectionAlias'
)
export const tutorialAliases = {
  [establishHeuristicsConnectionAlias.type]: establishHeuristicsConnection,
}
