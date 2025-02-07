export default function handler(req , res) {
    if(req.method === 'POST'){
        const {type , data} = req.body;

    // Process signaling messages
    if (type === "offer") {
        console.log("Received Offer:", data);
    } else if (type === "answer") {
        console.log("Received Answer:", data);
    } else if (type === "candidate") {
        console.log("Received ICE Candidate:", data);
    }
    res.status(200).json({message: 'Signaling message received'});
    }
    else{
        res.status(405).json({message: 'Method not allowed'});
    }
}