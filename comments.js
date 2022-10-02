// Api Functions
// 1 - getting all the tours
// const getAllTours = (req, res) => {
//   res.status(200).json({
//     status: 'success',
//     results: tours.length,
//     data: {
//       tours,
//     },
//   });
// };

// 2 - creating a new tour
// const createTour = (req, res) => {
//   const newId = tours[tours.length - 1].id + 1;
//   console.log(req.body);
//   const newTour = Object.assign({ id: newId }, req.body);
//   tours.push(newTour);
//   fs.writeFile(
//     `${__dirname}/dev-data/data/tours-simple.json`,
//     JSON.stringify(tours),
//     () => {
//       res.status(201).json({
//         status: 'succes',
//         data: {
//           newTour,
//         },
//       });
//     }
//   );
// };

// 3 - get tour by id
// const getTour = (req, res) => {
//   const { id } = req.params;
//   const tour = tours.find((e) => e.id === id * 1);
//   //   if (tours.length < id * 1) {
//   if (!tour) {
//     res.status(404).json({
//       status: 'fail',
//       message: 'invalid id',
//     });
//   }
//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour,
//     },
//   });
// };

// 4 - patching a tour
// const patchTour = (req, res) => {
//   if (req.params.id * 1 > tours.length) {
//     res.status(404).json({
//       status: 'fail',
//       message: 'Invalid Id',
//     });
//   }

//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour: 'Updating Tour',
//     },
//   });
// };

// 5 - deleting a tour
// const deleteTour = (req, res) => {
//   if (req.params.id * 1 > tours.length) {
//     res.status(404).json({
//       status: 'fail',
//       message: 'Invalid Id',
//     });
//   }
//   res.status(204).json({
//     status: 'success',
//     data: null,
//   });
// };

/* // getting the tours data from the v1 api
app.get('/api/v1/tours', getAllTours);

// creating new tour using the v1 of the api
app.post('/api/v1/tours', createTour);

// getting tour by id
app.get('/api/v1/tours/:id', getTour);

// updating a tour using patch request
app.patch('/api/v1/tours/:id', patchTour);

// deleting a tour
app.delete('/api/v1/tours/:id', deleteTour); */
