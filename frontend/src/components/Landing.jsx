import React from "react";

export default function Landing({ startApp }) {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 flex flex-col">

      {/* MAIN CONTENT */}
      <div className="flex flex-1 items-center justify-center px-6">

        <div className="max-w-4xl text-center">

          {/* Title */}
          <h1 className="text-5xl font-extrabold mb-4 text-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text">
            SmartDocs AI
          </h1>

          <p className="text-lg mb-8 text-gray-300">
            AI-powered document assistant that lets you upload PDFs and instantly get answers with verified sources.
          </p>

          {/* Button */}
          <button
            onClick={startApp}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold px-8 py-4 rounded-2xl shadow-xl hover:scale-105 hover:shadow-purple-500/50 transition duration-300"
          >
            Try Demo
          </button>

          {/* FEATURES */}
          <div className="grid md:grid-cols-3 gap-6 mt-16">

            <div className="bg-gray-900/50 backdrop-blur-lg p-6 rounded-2xl border border-purple-700/30 shadow-lg hover:shadow-purple-500/50 transition">
              <h3 className="text-purple-400 font-semibold text-lg mb-2">Upload PDFs</h3>
              <p className="text-gray-300 text-sm">
                Upload documents and analyze them instantly.
              </p>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-lg p-6 rounded-2xl border border-pink-600/30 shadow-lg hover:shadow-pink-400/50 transition">
              <h3 className="text-pink-400 font-semibold text-lg mb-2">Ask Questions</h3>
              <p className="text-gray-300 text-sm">
                Ask natural language questions from documents.
              </p>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-lg p-6 rounded-2xl border border-indigo-600/30 shadow-lg hover:shadow-indigo-400/50 transition">
              <h3 className="text-indigo-400 font-semibold text-lg mb-2">Source Citations</h3>
              <p className="text-gray-300 text-sm">
                AI answers include page references for accuracy.
              </p>
            </div>

          </div>

        </div>
      </div>

      {/* FOOTER */}
      <footer className="text-center text-gray-500 text-sm py-6 border-t border-gray-800">
        © {new Date().getFullYear()} SmartDocs AI. All rights reserved. <br />
        Built by Athira S M
      </footer>
    </div>
  );
}