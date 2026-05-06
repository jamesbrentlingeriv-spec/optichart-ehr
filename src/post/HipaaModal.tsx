import { X, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface HipaaModalProps {
  open: boolean;
  onAgree: () => void;
  onClose: () => void;
}

export default function HipaaModal({ open, onAgree, onClose }: HipaaModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[2000] bg-black/70 backdrop-blur-sm flex justify-center items-start overflow-y-auto pt-10 pb-10 px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="bg-white rounded-xl w-full max-w-2xl shadow-2xl relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-black px-6 py-5 flex justify-between items-center">
              <h2 className="text-lg font-black text-white uppercase tracking-tight">
                Notice of Privacy Practices
              </h2>
              <button
                onClick={onClose}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-6 space-y-5 max-h-[60vh] overflow-y-auto">
              <p className="text-xs font-bold uppercase text-gray-400 tracking-wider">
                Our Commitment to Your Privacy
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">
                This notice describes how medical information about you may be used and disclosed, and how you can get access to this information. Please review it carefully.
              </p>

              <div>
                <h3 className="text-sm font-black uppercase text-black mb-2">
                  1. How We May Use and Disclose Your Health Information
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed mb-3">
                  We are permitted by federal law to use and disclose your protected health information (PHI) for the following purposes without your explicit written authorization:
                </p>
                <ul className="space-y-3 text-sm text-gray-700 pl-4">
                  <li>
                    <strong className="text-black">For Treatment:</strong> We may use and share your health information to provide, coordinate, or manage your healthcare. For example, sharing prescription information or coordinating care with your doctor or a specialist.
                  </li>
                  <li>
                    <strong className="text-black">For Payment:</strong> We may use and disclose your information so that the services you receive can be billed and payment can be collected from you, an insurance company, or a third party.
                  </li>
                  <li>
                    <strong className="text-black">For Healthcare Operations:</strong> We may use and disclose your information to run our practice, improve your care, and contact you when necessary (such as appointment reminders).
                  </li>
                  <li>
                    <strong className="text-black">As Required by Law:</strong> We will disclose your health information when required to do so by federal, state, or local law (e.g., public health safety, law enforcement requests, or audits).
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-black uppercase text-black mb-2">
                  2. Your Rights Regarding Your Health Information
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed mb-3">
                  When it comes to your health information, you have specific rights under federal law:
                </p>
                <ul className="space-y-2 text-sm text-gray-700 pl-4 list-disc">
                  <li><strong className="text-black">Get an Electronic or Paper Copy of Your Records:</strong> You can ask to see or get a copy of your health and billing records. We will provide these, usually within 30 days.</li>
                  <li><strong className="text-black">Ask Us to Correct Your Records:</strong> You can ask us to correct health or billing records if you believe they are incorrect or incomplete.</li>
                  <li><strong className="text-black">Request Confidential Communications:</strong> You can ask us to contact you in a specific way (for example, home or office phone) or to send mail to a different address.</li>
                  <li><strong className="text-black">Limit What We Use or Share:</strong> You can ask us not to use or share certain health information for treatment, payment, or our operations. We are not required to agree to your request, but we will say "yes" if it meets certain legal criteria (such as paying out-of-pocket in full for a service).</li>
                  <li><strong className="text-black">Get a List of Those with Whom We've Shared Information:</strong> You can ask for a list (accounting) of the times we've shared your health information, who we shared it with, and why, for up to six years prior to the date of your request.</li>
                  <li><strong className="text-black">Get a Copy of This Notice:</strong> You can ask for a paper copy of this notice at any time, even if you have agreed to receive it electronically.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-black uppercase text-black mb-2">
                  3. Our Responsibilities
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  We are required by law to maintain the privacy and security of your protected health information. We will let you know promptly if a breach occurs that may have compromised the privacy or security of your information. We must follow the duties and privacy practices described in this notice and give you a copy of it. We will not use or share your information other than as described here unless you tell us we can in writing. You may change your mind at any time by letting us know in writing.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-black uppercase text-black mb-2">
                  4. Questions and Complaints
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed mb-3">
                  If you believe your privacy rights have been violated, you may file a complaint with us or with the U.S. Department of Health and Human Services Office for Civil Rights.
                </p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  To file a complaint or ask questions about this notice, please contact:
                </p>
                <div className="mt-2 bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-700 space-y-1">
                  <p><strong className="text-black">Privacy Officer:</strong> Office Manager</p>
                  <p><strong className="text-black">Practice Name:</strong> Pal Optical</p>
                  <p><strong className="text-black">Phone:</strong> (859) 266-3003</p>
                  <p><strong className="text-black">Address:</strong> 1555 E New Circle Road, Ste 146, Lexington, KY 40509</p>
                </div>
                <p className="mt-3 text-sm text-gray-700 italic">
                  We will not retaliate against you for filing a complaint.
                </p>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  onAgree();
                  onClose();
                }}
                className="flex-1 bg-black text-white font-black uppercase tracking-widest py-3 rounded-xl shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                I Have Read and Agree
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-white text-black border border-gray-300 font-black uppercase tracking-widest py-3 rounded-xl hover:bg-gray-100 transition-all"
              >
                Decline
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}