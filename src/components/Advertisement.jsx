// import { useEffect, useState } from 'react';
// import './Advertisement.css';

// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// function Advertisement({ placement = 'homepage-middle' }) {
//   const [advertisements, setAdvertisements] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchAdvertisements = async () => {
//       try {
//         const response = await fetch(
//           `${API_URL}/advertisements/position/${placement}`
//         );

//         const result = await response.json();

//         if (!response.ok) {
//           throw new Error('Advertisement load failed');
//         }

//         setAdvertisements(result.data || []);
//       } catch (error) {
//         console.error('Advertisement Error:', error);
//         setAdvertisements([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchAdvertisements();
//   }, [placement]);

//   if (loading || advertisements.length === 0) {
//     return null;
//   }

//   return (
//     <section className="advertisement-section">
//       {advertisements.map((ad) => (
//         <div className="advertisement-card" key={ad._id}>
//           <span className="advertisement-label">Advertisement</span>

//           {ad.image && (
//             <img
//               src={
//                 ad.image.startsWith('http')
//                   ? ad.image
//                   : `http://localhost:5000${ad.image}`
//               }
//               alt={ad.title}
//               className="advertisement-image"
//             />
//           )}

//           {ad.headline && <h3>{ad.headline}</h3>}

//           {ad.description && <p>{ad.description}</p>}

//           {ad.price && <p>মূল্য: {ad.price}</p>}

//           {ad.offer && <p>{ad.offer}</p>}

//           {ad.targetUrl && (
//             <a
//               href={ad.targetUrl}
//               target="_blank"
//               rel="noopener noreferrer"
//               className="advertisement-button"
//             >
//               {ad.buttonText || 'বিস্তারিত দেখুন'}
//             </a>
//           )}
//         </div>
//       ))}
//     </section>
//   );
// }

// export default Advertisement;
