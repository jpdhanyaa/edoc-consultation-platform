import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, onSnapshot, addDoc, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { MedicalReport, AppUser } from '../types';
import { handleFirestoreError, OperationType } from '../lib/utils';
import { FileText, Plus, Trash2, Clock, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function MedicalReports({ patientId, isDoctor, doctorName }: { patientId: string, isDoctor: boolean, doctorName?: string }) {
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'users', patientId, 'reports')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MedicalReport));
      setReports(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, `users/${patientId}/reports`);
    });

    return () => unsubscribe();
  }, [patientId]);

  const addReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    try {
      await addDoc(collection(db, 'users', patientId, 'reports'), {
        title,
        content,
        patientId,
        issuedBy: doctorName || (isDoctor ? "Specialist" : "Patient"),
        createdAt: new Date().toISOString()
      });
      setTitle('');
      setContent('');
      setShowAdd(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${patientId}/reports`);
    }
  };

  const deleteReport = async (reportId: string) => {
    if (!window.confirm('Delete this report?')) return;
    try {
      await deleteDoc(doc(db, 'users', patientId, 'reports', reportId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${patientId}/reports/${reportId}`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          Medical Reports & Records
        </h3>
        <button 
          onClick={() => setShowAdd(true)}
          className="text-sm bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg font-bold hover:bg-blue-600 hover:text-white transition-all flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          {isDoctor ? 'Issue New Report' : 'Add My Record'}
        </button>
      </div>

      {showAdd && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm space-y-3"
        >
          <input 
            type="text" 
            placeholder="Report Title (e.g. Blood Test - May 2024)"
            className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-500"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea 
            placeholder="Details, results, or links to external files..."
            className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-500 h-24"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <button 
              onClick={() => setShowAdd(false)}
              className="text-xs font-bold text-slate-500 px-2 py-1"
            >
              Cancel
            </button>
            <button 
              onClick={addReport}
              className="text-xs font-bold bg-blue-600 text-white px-3 py-1 rounded-lg"
            >
              Save Report
            </button>
          </div>
        </motion.div>
      )}

      <div className="space-y-3">
        {loading ? (
          <div className="py-8 text-center text-slate-400 text-sm italic tracking-wide">Syncing records...</div>
        ) : reports.length === 0 ? (
          <div className="py-8 text-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
             <AlertCircle className="h-8 w-8 text-slate-300 mx-auto mb-2" />
             <p className="text-slate-500 text-sm">No medical records uploaded.</p>
          </div>
        ) : (
          reports.map(report => (
            <div key={report.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-slate-700 text-sm">{report.title}</h4>
                {!isDoctor && (
                  <button 
                    onClick={() => deleteReport(report.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-red-500 transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-600 whitespace-pre-wrap mb-3 leading-relaxed">{report.content}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                   <Clock className="h-3 w-3" />
                   {new Date(report.createdAt).toLocaleDateString()}
                </div>
                {(report as any).issuedBy && (
                   <span className="text-[9px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md font-black uppercase tracking-tighter">
                      Issuer: {(report as any).issuedBy}
                   </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
