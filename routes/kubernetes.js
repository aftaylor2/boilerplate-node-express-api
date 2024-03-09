import mongoose  from 'mongoose';
import express from 'express';

const router = express.Router({ mergeParams: true });

// Validate express is responding to requests and not deadlocked
// If Kubelet fails this test, pod is killed and recreated
const livenessCheck =  (req, res) => res.sendStatus(200); 

router.route('/liveness').get(livenessCheck); 

router.route('/healthz').get((req, res) => {
  //  if (!isMongoConnected()) return res.status(500);
    return res.sendStatus(200);
  });


function isMongoConnected() {
  if (!mongoose || mongoose.connection.readyState !== 1) return false;
  return true;
}

export default router;


