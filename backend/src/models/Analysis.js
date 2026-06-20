import mongoose from 'mongoose'

const analysisSchema = new mongoose.Schema(
  {
    inputType: { type: String, default: 'jira' },
    inputValue: String,
    ticketKeys: [String],
    payload: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true },
)

export const AnalysisModel = mongoose.model('Analysis', analysisSchema)
