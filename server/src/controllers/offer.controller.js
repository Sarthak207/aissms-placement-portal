const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const offerService = require('../services/offer.service');

const issue = asyncHandler(async (req, res) => {
  const io = req.app.get('io');
  const offer = await offerService.issueOffer(io, req.body, req.user);
  return new ApiResponse(201, offer, 'Offer letter issued').send(res);
});

const myOffers = asyncHandler(async (req, res) => {
  const offers = await offerService.myOffers(req.user._id);
  return new ApiResponse(200, offers).send(res);
});

const download = asyncHandler(async (req, res) => {
  const offer = await offerService.getOfferById(req.params.id, req.user);
  return new ApiResponse(200, { pdfUrl: offer.pdfUrl }, 'Offer letter URL').send(res);
});

module.exports = { issue, myOffers, download };
