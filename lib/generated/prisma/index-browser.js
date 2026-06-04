
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
} = require('./runtime/index-browser')


const Prisma = {}

exports.Prisma = Prisma

/**
 * Prisma Client JS version: 4.16.2
 * Query Engine version: 4bc8b6e1b66cb932731fb1bdbbc550d1e010de81
 */
Prisma.prismaVersion = {
  client: "4.16.2",
  engine: "4bc8b6e1b66cb932731fb1bdbbc550d1e010de81"
}

Prisma.PrismaClientKnownRequestError = () => {
  throw new Error(`PrismaClientKnownRequestError is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  throw new Error(`PrismaClientUnknownRequestError is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.PrismaClientRustPanicError = () => {
  throw new Error(`PrismaClientRustPanicError is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.PrismaClientInitializationError = () => {
  throw new Error(`PrismaClientInitializationError is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.PrismaClientValidationError = () => {
  throw new Error(`PrismaClientValidationError is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.NotFoundError = () => {
  throw new Error(`NotFoundError is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  throw new Error(`sqltag is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.empty = () => {
  throw new Error(`empty is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.join = () => {
  throw new Error(`join is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.raw = () => {
  throw new Error(`raw is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  throw new Error(`Extensions.getExtensionContext is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.defineExtension = () => {
  throw new Error(`Extensions.defineExtension is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}

/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  email: 'email',
  password: 'password',
  name: 'name',
  whatsapp: 'whatsapp',
  address: 'address',
  city: 'city',
  state: 'state',
  role: 'role',
  emailVerifiedAt: 'emailVerifiedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CategoryScalarFieldEnum = {
  id: 'id',
  name: 'name',
  icon: 'icon',
  imageUrl: 'imageUrl',
  sortOrder: 'sortOrder',
  createdAt: 'createdAt'
};

exports.Prisma.SubcategoryScalarFieldEnum = {
  id: 'id',
  name: 'name',
  categoryId: 'categoryId',
  createdAt: 'createdAt'
};

exports.Prisma.CourseScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  categoryId: 'categoryId',
  subcategoryId: 'subcategoryId',
  pdfUrl: 'pdfUrl',
  videoUrl: 'videoUrl',
  thumbnailUrl: 'thumbnailUrl',
  syllabus: 'syllabus',
  workloadHours: 'workloadHours',
  seoTitle: 'seoTitle',
  seoDescription: 'seoDescription',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.LessonScalarFieldEnum = {
  id: 'id',
  courseId: 'courseId',
  title: 'title',
  sortOrder: 'sortOrder',
  videoUrl: 'videoUrl',
  materialUrl: 'materialUrl',
  durationMinutes: 'durationMinutes',
  createdAt: 'createdAt'
};

exports.Prisma.EnrollmentScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  courseId: 'courseId',
  enrolledAt: 'enrolledAt',
  progress: 'progress'
};

exports.Prisma.SubscriptionScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  plan: 'plan',
  startDate: 'startDate',
  endDate: 'endDate',
  active: 'active',
  createdAt: 'createdAt'
};

exports.Prisma.PaymentScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  amount: 'amount',
  currency: 'currency',
  status: 'status',
  provider: 'provider',
  purpose: 'purpose',
  courseId: 'courseId',
  externalId: 'externalId',
  stripeId: 'stripeId',
  couponId: 'couponId',
  createdAt: 'createdAt'
};

exports.Prisma.CouponScalarFieldEnum = {
  id: 'id',
  code: 'code',
  description: 'description',
  discountPercent: 'discountPercent',
  discountCents: 'discountCents',
  maxUses: 'maxUses',
  usedCount: 'usedCount',
  validFrom: 'validFrom',
  validUntil: 'validUntil',
  active: 'active',
  createdAt: 'createdAt'
};

exports.Prisma.EmailCampaignScalarFieldEnum = {
  id: 'id',
  subject: 'subject',
  bodyHtml: 'bodyHtml',
  status: 'status',
  recipientFilter: 'recipientFilter',
  sentCount: 'sentCount',
  createdAt: 'createdAt',
  sentAt: 'sentAt'
};

exports.Prisma.CertificateScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  courseId: 'courseId',
  certificateNumber: 'certificateNumber',
  issuedAt: 'issuedAt',
  pdfUrl: 'pdfUrl',
  qrCode: 'qrCode'
};

exports.Prisma.QuizScalarFieldEnum = {
  id: 'id',
  courseId: 'courseId',
  questions: 'questions',
  createdAt: 'createdAt'
};

exports.Prisma.QuizAttemptScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  quizId: 'quizId',
  answers: 'answers',
  score: 'score',
  passed: 'passed',
  attemptedAt: 'attemptedAt'
};

exports.Prisma.AffiliateScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  referralCode: 'referralCode',
  createdAt: 'createdAt'
};

exports.Prisma.AffiliateCommissionScalarFieldEnum = {
  id: 'id',
  affiliateId: 'affiliateId',
  referredUserId: 'referredUserId',
  amount: 'amount',
  status: 'status',
  createdAt: 'createdAt'
};

exports.Prisma.ReferralScalarFieldEnum = {
  id: 'id',
  affiliateId: 'affiliateId',
  referredUserId: 'referredUserId',
  createdAt: 'createdAt'
};

exports.Prisma.EmailVerificationTokenScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  tokenHash: 'tokenHash',
  expiresAt: 'expiresAt',
  used: 'used',
  createdAt: 'createdAt'
};

exports.Prisma.PasswordResetTokenScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  tokenHash: 'tokenHash',
  expiresAt: 'expiresAt',
  used: 'used',
  createdAt: 'createdAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};


exports.Prisma.ModelName = {
  User: 'User',
  Category: 'Category',
  Subcategory: 'Subcategory',
  Course: 'Course',
  Lesson: 'Lesson',
  Enrollment: 'Enrollment',
  Subscription: 'Subscription',
  Payment: 'Payment',
  Coupon: 'Coupon',
  EmailCampaign: 'EmailCampaign',
  Certificate: 'Certificate',
  Quiz: 'Quiz',
  QuizAttempt: 'QuizAttempt',
  Affiliate: 'Affiliate',
  AffiliateCommission: 'AffiliateCommission',
  Referral: 'Referral',
  EmailVerificationToken: 'EmailVerificationToken',
  PasswordResetToken: 'PasswordResetToken'
};

/**
 * Create the Client
 */
class PrismaClient {
  constructor() {
    throw new Error(
      `PrismaClient is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
    )
  }
}
exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
