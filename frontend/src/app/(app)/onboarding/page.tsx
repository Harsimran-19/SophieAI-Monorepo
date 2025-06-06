"use client"

import { useEffect } from "react"
import { redirect } from "next/navigation"
import { useAuth } from "@/context/AuthProvider"

import { OnboardingForm } from "@/components/forms/onboarding-form"

export default function OnboardingPage() {
  const { user, profile, loading } = useAuth()

  useEffect(() => {
    if (loading) return // wait until auth is loaded

    if (!user) {
      redirect("/signin")
    }

    if (profile?.first_name && profile?.last_name) {
      redirect("/app")
    }
  }, [user, profile, loading])

  if (loading || !user) {
    return null
  }

  return (
    <main className="container flex min-h-screen w-full flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Complete Your Profile
          </h1>
          <p className="text-sm text-muted-foreground">
            Please enter your name to continue
          </p>
        </div>
        <OnboardingForm />
      </div>
    </main>
  )
}

// "use client";

// import { useState } from "react";
// import { Card } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import { ArrowRight, ArrowLeft, Rocket, User, File, Loader2, Check, Upload } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { useRouter } from "next/navigation";
// import { jobTitlesByIndustry, industries } from "@/data/onboarding-data";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import ResumeUploadModal from "@/components/onboarding/resumeUploadModal";

// interface FormData {
//   name: string;
//   industry: string;
//   jobTitles: string[];
//   resume: File | undefined;
//   resumeDisplayName: string;
// }

// const steps = [
//   { id: "personal", name: "Personal Info", icon: User },
//   { id: "preferences", name: "Preferences", icon: Rocket },
//   { id: "resume", name: "Upload Resume", icon: File },
// ];

// export default function OnboardingPage() {
//   const router = useRouter();
//   const [currentStep, setCurrentStep] = useState(0);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
//   const [formData, setFormData] = useState<FormData>({
//     name: "",
//     industry: "",
//     jobTitles: [],
//     resume: undefined,
//     resumeDisplayName: "",
//   });

//   // Rest of the helper functions remain the same...
//   const getSelectedIndustries = () => formData.industry ? formData.industry.split(',') : [];
//   const setSelectedIndustries = (industries: string[]) => {
//     setFormData(prev => ({
//       ...prev,
//       industry: industries.join(',')
//     }));
//   };

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//   };

//   const handleIndustryChange = (industry: string) => {
//     const currentIndustries = getSelectedIndustries().filter(Boolean);
//     if (currentIndustries.includes(industry)) {
//       const updatedIndustries = currentIndustries.filter(ind => ind !== industry);
//       const remainingIndustriesJobTitles = updatedIndustries.flatMap(ind => jobTitlesByIndustry[ind]);
//       setFormData(prev => ({
//         ...prev,
//         industry: updatedIndustries.join(','),
//         jobTitles: prev.jobTitles.filter(title =>
//           remainingIndustriesJobTitles.includes(title)
//         )
//       }));
//     } else {
//       const newIndustries = [...currentIndustries, industry];
//       setFormData(prev => ({
//         ...prev,
//         industry: newIndustries.join(',')
//       }));
//     }
//   };

//   const handleJobTitleChange = (jobTitle: string) => {
//     setFormData((prev) => {
//       const currentTitles = prev.jobTitles;
//       if (currentTitles.includes(jobTitle)) {
//         return {
//           ...prev,
//           jobTitles: currentTitles.filter((title) => title !== jobTitle)
//         };
//       } else if (currentTitles.length < 3) {
//         return {
//           ...prev,
//           jobTitles: [...currentTitles, jobTitle]
//         };
//       }
//       return prev;
//     });
//   };

//   // Handle resume upload from modal
//   const handleResumeUpload = (file: File, displayName: string) => {
//     setFormData({
//       ...formData,
//       resume: file,
//       resumeDisplayName: displayName
//     });
//   };

//   const handleNext = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
//   const handleBack = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setIsLoading(true);

//     const formDataToSubmit = new FormData();
//     formDataToSubmit.append('name', formData.name);
//     formDataToSubmit.append('industry', formData.industry);
//     formDataToSubmit.append('jobTitles', JSON.stringify(formData.jobTitles));

//     // Add resume file and display name if available
//     if (formData.resume) {
//       formDataToSubmit.append('resume', formData.resume);
//       formDataToSubmit.append('resumeDisplayName', formData.resumeDisplayName);
//     }

//     try {
//       const response = await fetch('/api/onboarding', {
//         method: 'POST',
//         body: formDataToSubmit,
//       });

//       const result = await response.json();

//       if (result.success) {
//         router.push('/dashboard');
//       } else {
//         console.error('Submission failed:', result.error);
//         // Handle error - you might want to show an error message to the user
//       }
//     } catch (error) {
//       console.error('Error submitting form:', error);
//       // Handle error - you might want to show an error message to the user
//     }
//   };

//   // Render functions remain the same...
//   const renderStep1 = () => (
//     <div className="space-y-4">
//       <div>
//         <Label htmlFor="name">Full Name</Label>
//         <Input
//           id="name"
//           name="name"
//           value={formData.name}
//           onChange={handleInputChange}
//           placeholder="Enter your Name"
//           className="mt-1"
//           required
//         />
//       </div>
//       <div>
//         <Label className="block mb-3">Select Industries (Multiple)</Label>
//         <ScrollArea className="h-[400px] rounded-md border">
//           <div className="grid grid-cols-3 gap-3">
//             {industries.map((industry) => {
//               const isSelected = getSelectedIndustries().includes(industry);
//               return (
//                 <button
//                   key={industry}
//                   type="button"
//                   onClick={() => handleIndustryChange(industry)}
//                   className={cn(
//                     "p-3 text-sm rounded-lg border-2 transition-all duration-200 flex items-center justify-between",
//                     "hover:border-primary hover:bg-primary/5",
//                     isSelected
//                       ? "border-primary bg-primary/10 text-primary"
//                       : "border-muted bg-background text-muted-foreground"
//                   )}
//                 >
//                   <span className="text-left">{industry}</span>
//                   {isSelected && <Check className="w-4 h-4 ml-2 flex-shrink-0" />}
//                 </button>
//               );
//             })}
//           </div>
//         </ScrollArea>
//       </div>
//     </div>
//   );

//   const renderStep2 = () => {
//     const selectedIndustries = getSelectedIndustries();
//     const availableJobTitles = selectedIndustries.flatMap(industry =>
//       jobTitlesByIndustry[industry] || []
//     );
//     const uniqueJobTitles = Array.from(new Set(availableJobTitles));
//     const remainingSelections = 3 - formData.jobTitles.length;

//     return (
//       <div className="space-y-4">
//         <Label className="block mb-3">Select Job Titles ({remainingSelections} remaining)</Label>
//         <ScrollArea className="h-[400px] rounded-md border">
//           <div className="grid grid-cols-3 gap-3 p-4">
//             {uniqueJobTitles.map((title) => {
//               const isSelected = formData.jobTitles.includes(title);
//               const isDisabled = !isSelected && remainingSelections === 0;
//               return (
//                 <button
//                   key={title}
//                   type="button"
//                   onClick={() => handleJobTitleChange(title)}
//                   disabled={isDisabled}
//                   className={cn(
//                     "p-3 text-sm rounded-lg border-2 transition-all duration-200 flex items-center justify-between",
//                     "hover:border-primary hover:bg-primary/5",
//                     isSelected
//                       ? "border-primary bg-primary/10 text-primary"
//                       : "border-muted bg-background text-muted-foreground",
//                     isDisabled && "opacity-50 cursor-not-allowed hover:border-muted hover:bg-background"
//                   )}
//                 >
//                   <span className="text-left">{title}</span>
//                   {isSelected && <Check className="w-4 h-4 ml-2 flex-shrink-0" />}
//                 </button>
//               );
//             })}
//           </div>
//         </ScrollArea>
//       </div>
//     );
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-r from-background to-pink-400/10 flex items-center justify-center p-4">
//       <Card className="w-full max-w-2xl p-8 shadow-lg">
//         <div className="flex justify-between mb-8">
//           {steps.map((step, index) => (
//             <div key={step.id} className="flex flex-col items-center">
//               <div
//                 className={cn(
//                   "w-10 h-10 rounded-full flex items-center justify-center mb-2",
//                   currentStep === index
//                     ? "bg-primary text-primary-foreground"
//                     : index < currentStep
//                     ? "bg-primary/20 text-primary"
//                     : "bg-muted text-muted-foreground"
//                 )}
//               >
//                 <step.icon className="w-5 h-5" />
//               </div>
//               <span className={cn(
//                 "text-sm",
//                 currentStep === index ? "text-primary font-medium" : "text-muted-foreground"
//               )}>
//                 {step.name}
//               </span>
//             </div>
//           ))}
//         </div>

//         <form onSubmit={handleSubmit}>
//           {currentStep === 0 && renderStep1()}
//           {currentStep === 1 && renderStep2()}
//           {currentStep === 2 && (
//             <div className="space-y-6">
//               <div>
//                 <h3 className="text-lg font-medium mb-2">Resume Upload (Optional)</h3>
//                 <p className="text-sm text-gray-500 mb-6">
//                   Upload your resume to get personalized job recommendations and AI-powered resume analysis.
//                 </p>

//                 {formData.resume ? (
//                   <div className="border rounded-md p-4 bg-gray-50">
//                     <div className="flex items-center justify-between">
//                       <div className="flex items-center">
//                         {/* <FileText className="h-8 w-8 text-blue-500 mr-3" /> */}
//                         <div>
//                           <p className="font-medium">{formData.resumeDisplayName}</p>
//                           <p className="text-sm text-gray-500">{formData.resume.name}</p>
//                         </div>
//                       </div>
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={() => setIsUploadModalOpen(true)}
//                       >
//                         Change
//                       </Button>
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-md">
//                     {/* <FileText className="h-12 w-12 text-gray-400 mb-3" /> */}
//                     <p className="text-sm text-gray-500 mb-4">No resume uploaded yet</p>
//                     <Button
//                       onClick={() => setIsUploadModalOpen(true)}
//                       className="flex items-center gap-2"
//                     >
//                       <Upload className="h-4 w-4" />
//                       Upload Resume
//                     </Button>
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}

//           {/* Resume Upload Modal */}
//           <ResumeUploadModal
//             isOpen={isUploadModalOpen}
//             onClose={() => setIsUploadModalOpen(false)}
//             onUpload={handleResumeUpload}
//           />

//           <div className="flex justify-between mt-8">
//             <Button
//               type="button"
//               variant="outline"
//               onClick={handleBack}
//               disabled={currentStep === 0 || isLoading}
//             >
//               <ArrowLeft className="w-4 h-4 mr-2" />
//               Back
//             </Button>
//             {currentStep === steps.length - 1 ? (
//               <Button type="submit" disabled={isLoading}>
//                 {isLoading ? (
//                   <>
//                     <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                     Submitting...
//                   </>
//                 ) : (
//                   <>
//                     Complete
//                     <Rocket className="w-4 h-4 ml-2" />
//                   </>
//                 )}
//               </Button>
//             ) : (
//               <Button type="button" onClick={handleNext}>
//                 Next
//                 <ArrowRight className="w-4 h-4 ml-2" />
//               </Button>
//             )}
//           </div>
//         </form>
//       </Card>
//     </div>
//   );
// }
