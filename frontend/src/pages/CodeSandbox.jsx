import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import Platform from "./Platform";
const CodeSandbox = () => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [formData, setFormData] = useState({
    Questions: [],
    TestCases: [],
    Outputs: [],
  });
  const [role, setRole] = useState("user");
  useEffect(() => {
    if (!token) {
      toast.error("Authentication required. Please log in.");
      setRole("user");
      return;
    }
    try {
      const decodedToken = jwtDecode(token);
      if (decodedToken && decodedToken.role) {
        setRole(decodedToken.role);
      } else {
        setRole("user");
      }
    } catch (e) {
      console.error("Failed to process token:", e);
      toast.error("Invalid session. Please log in again.");
      setRole("user");
    }
  }, [token]);

  const handleAddQuestion = () => {
    setFormData((prev) => {
      return {
        ...prev,
        Questions: [...prev.Questions, ""],
      };
    });
  };
  const handleQuestionChange = (index, value) => {
    setFormData((prevFormData) => {
      const newQuestions = [...prevFormData.Questions];
      newQuestions[index] = value;
      return { ...prevFormData, Questions: newQuestions };
    });
  };
  const handleAddTestCase = (index) => {
    setFormData((prev) => {
      const newTestCases = [...prev.TestCases];
      const newOutputs = [...prev.Outputs];
      newOutputs[index] = [...(prev.Outputs[index] || []), ""];
      newTestCases[index] = [...(prev.TestCases[index] || []), ""];
      return { ...prev, TestCases: newTestCases, Outputs: newOutputs };
    });
  };
  const handleTestCaseInputChange = (qIndex, tcIndex, value) => {
    setFormData((prevFormData) => {
      const newTestCases = [...prevFormData.TestCases];
      const testCaseArray = [...(newTestCases[qIndex] || [])];
      testCaseArray[tcIndex] = value;
      newTestCases[qIndex] = testCaseArray;
      return { ...prevFormData, TestCases: newTestCases };
    });
  };

  const handleOutputInputChange = (qIndex, tcIndex, value) => {
    setFormData((prevFormData) => {
      const newOutputs = [...prevFormData.Outputs];
      const outputArray = [...(newOutputs[qIndex] || [])];
      outputArray[tcIndex] = value;
      newOutputs[qIndex] = outputArray;
      return { ...prevFormData, Outputs: newOutputs };
    });
  };
  const handleDeleteQuestion = (index) => {
    const copyArr = [...formData.TestCases];
    const copyArr2 = [...formData.Outputs];
    copyArr.splice(index, 1);
    copyArr2.splice(index, 1);
    console.log(copyArr, copyArr2);
    setFormData({
      ...formData,
      Questions: formData.Questions.filter((_, i) => i !== index),
      TestCases: copyArr,
      Outputs: copyArr2,
    });
  };
  const handleDeleteTestCase = (index, idx) => {
    setFormData((prevFormData) => {
      const newTestCases = [...prevFormData.TestCases];
      const newOutputs = [...prevFormData.Outputs];
      newTestCases[index].splice(idx, 1);
      newOutputs[index].splice(idx, 1);
      return { ...prevFormData, TestCases: newTestCases, Outputs: newOutputs };
    });
  };
  return (
    <div className="min-h-screen bg-slate-900 text-white font-inter">
      <ToastContainer position="bottom-right" theme="dark" />

      {role === "admin" ? (
        <div className="container mx-auto p-4 md:p-8 max-w-4xl">
          <h1
            className="text-4xl font-bold mb-8 text-center"
            style={{
              background: "linear-gradient(45deg, #a78bfa, #f472b6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            CodeSandbox Admin Setup
          </h1>

          <button
            onClick={handleAddQuestion}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition duration-200 mb-6 flex items-center justify-center"
          >
            ➕ Add New Programming Question
          </button>

          <div className="space-y-6">
            {formData.Questions.map((question, qIndex) => (
              <div
                key={qIndex}
                className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl"
              >
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-700">
                  <h2 className="text-2xl font-semibold text-violet-400">
                    Question {qIndex + 1}
                  </h2>
                  <button
                    onClick={() => handleDeleteQuestion(qIndex)}
                    className="bg-red-700 hover:bg-red-800 text-white text-sm font-medium py-1 px-3 rounded-full transition duration-200"
                  >
                    Delete Question
                  </button>
                </div>

                <label className="block text-slate-400 text-sm mb-2">
                  Question Text:
                </label>
                <textarea
                  rows="3"
                  placeholder="Enter the programming task description here..."
                  value={question}
                  onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                  className="w-full bg-slate-700 text-white border border-slate-600 rounded-lg p-3 focus:ring-violet-500 focus:border-violet-500 transition duration-150"
                />

                <h3 className="text-xl font-semibold mt-6 mb-4 text-violet-300">
                  Test Cases & Expected Outputs
                </h3>

                <button
                  onClick={() => handleAddTestCase(qIndex)}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition duration-200 mb-4"
                >
                  + Add Test Case Pair
                </button>

                <div className="space-y-3">
                  {(formData.TestCases[qIndex] || []).map(
                    (testCaseInput, tcIndex) => (
                      <div
                        key={tcIndex}
                        className="flex flex-col md:flex-row gap-3 p-3 bg-slate-700 rounded-lg border border-slate-600"
                      >
                        <span className="font-bold text-violet-300 w-12 flex-shrink-0">
                          TC {tcIndex + 1}:
                        </span>

                        <div className="flex-1">
                          <label className="text-slate-400 text-xs block mb-1">
                            Input:
                          </label>
                          <input
                            type="text"
                            placeholder="e.g., [1, 2, 3]"
                            value={testCaseInput}
                            onChange={(e) =>
                              handleTestCaseInputChange(
                                qIndex,
                                tcIndex,
                                e.target.value,
                              )
                            }
                            className="w-full bg-slate-800 text-white rounded-md px-3 py-1.5 focus:border-violet-500 focus:ring-violet-500"
                          />
                        </div>

                        <div className="flex-1">
                          <label className="text-slate-400 text-xs block mb-1">
                            Output:
                          </label>
                          <input
                            type="text"
                            placeholder="e.g., 6"
                            value={formData.Outputs[qIndex]?.[tcIndex] || ""}
                            onChange={(e) =>
                              handleOutputInputChange(
                                qIndex,
                                tcIndex,
                                e.target.value,
                              )
                            }
                            className="w-full bg-slate-800 text-white rounded-md px-3 py-1.5 focus:border-violet-500 focus:ring-violet-500"
                          />
                        </div>

                        <button
                          onClick={() => handleDeleteTestCase(qIndex, tcIndex)}
                          className="bg-red-500 hover:bg-red-600 text-white p-1 rounded-md text-sm transition duration-200 self-end md:self-center"
                        >
                          🗑️
                        </button>
                      </div>
                    ),
                  )}
                </div>
              </div>
            ))}
          </div>
          {/* TODO: Add backend endpoint for submitting all questions */}
          {formData.Questions.length > 0 && (
            <button
              onClick={() => {
                console.log("Final Submission Data:", formData);
              }}
              className="mt-8 w-full bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition duration-200"
            >
              Submit All Questions
            </button>
          )}
        </div>
      ) : (
        <Platform />
      )}
    </div>
  );
};

export default CodeSandbox;
