# PoultryCure - Full Supabase Migration Roadmap

**Timeline:** 4-5 weeks  
**Effort:** High  
**Strategy:** Phased migration with testing at each stage

---

## 📊 Overall Progress: 25% Complete

### ✅ **Phase 1: Authentication System** - COMPLETE (Week 1)
**Status:** ✅ **100% Complete**  
**Duration:** Completed  
**Effort:** High

#### Completed Tasks:
- ✅ Supabase project created and configured
- ✅ Environment variables set up (`.env`)
- ✅ Supabase client initialized (`lib/supabase.ts`)
- ✅ Database schema designed and implemented
  - ✅ `profiles` table created
  - ✅ Row Level Security (RLS) policies configured
  - ✅ Auto-profile creation trigger implemented
  - ✅ Timestamp management triggers
- ✅ New auth service created (`services/supabase-auth.ts`)
  - ✅ Signup functionality
  - ✅ Login functionality
  - ✅ Logout functionality
  - ✅ Password reset (email-based)
  - ✅ Profile updates
  - ✅ Get current user
- ✅ AuthContext migrated to Supabase
  - ✅ Auth state listener
  - ✅ Session persistence with AsyncStorage
  - ✅ Token auto-refresh
- ✅ Error handling enhanced
  - ✅ Supabase-specific error mapping
  - ✅ User-friendly error messages
- ✅ UI screens updated
  - ✅ Login screen
  - ✅ Signup screen
  - ✅ Forgot password screen
- ✅ Old auth service backed up (`services/auth.legacy.ts`)
- ✅ Documentation created
  - ✅ `SUPABASE_SETUP.sql`
  - ✅ `SUPABASE_MIGRATION_GUIDE.md`

#### Known Limitations:
- ⚠️ Password reset deep linking not configured (web redirect only)
- ⚠️ Email confirmation disabled for development
- ⚠️ Rate limiting active (4 signups/hour from same IP)

#### Testing Status:
- ✅ User signup tested and working
- ✅ User login tested and working
- ✅ Profile auto-creation verified
- ✅ Session persistence verified
- ⏳ Password reset (email sent, deep link pending)

---

## 🔄 **Phase 2: Data Storage & Sync** - NEXT UP (Week 2-3)
**Status:** 🔜 **Not Started**  
**Duration:** 1.5-2 weeks  
**Effort:** High

### 2.1 Database Schema Design
**Priority:** High  
**Estimated Time:** 2-3 days

#### Tasks:
- [ ] Design `diagnoses` table schema
  - [ ] Define columns and data types
  - [ ] Set up foreign key relationships
  - [ ] Add indexes for performance
  - [ ] Configure RLS policies
- [ ] Design `bookmarks` table (if needed)
- [ ] Design `user_settings` table (if needed)
- [ ] Create database migration scripts
- [ ] Document schema in ERD diagram

#### SQL Schema (Draft):
```sql
-- Diagnoses table
CREATE TABLE public.diagnoses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('symptom', 'image')),
  input TEXT NOT NULL,
  diagnosis TEXT NOT NULL,
  confidence NUMERIC(5,2) CHECK (confidence >= 0 AND confidence <= 100),
  recommendations JSONB,
  treatment TEXT,
  prevention TEXT,
  severity TEXT CHECK (severity IN ('low', 'moderate', 'high')),
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX diagnoses_user_id_idx ON public.diagnoses(user_id);
CREATE INDEX diagnoses_created_at_idx ON public.diagnoses(created_at DESC);
CREATE INDEX diagnoses_type_idx ON public.diagnoses(type);

-- RLS Policies
ALTER TABLE public.diagnoses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own diagnoses"
  ON public.diagnoses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own diagnoses"
  ON public.diagnoses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own diagnoses"
  ON public.diagnoses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own diagnoses"
  ON public.diagnoses FOR DELETE
  USING (auth.uid() = user_id);
```

### 2.2 Migrate Diagnosis History
**Priority:** High  
**Estimated Time:** 3-4 days

#### Tasks:
- [ ] Create Supabase service for diagnoses (`services/supabase-diagnoses.ts`)
  - [ ] `saveDiagnosis(diagnosis)` - Save new diagnosis
  - [ ] `getDiagnoses(userId, limit, offset)` - Fetch paginated history
  - [ ] `getDiagnosisById(id)` - Get single diagnosis
  - [ ] `deleteDiagnosis(id)` - Delete diagnosis
  - [ ] `updateDiagnosis(id, updates)` - Update diagnosis
- [ ] Update `DiagnosisContext.tsx`
  - [ ] Replace local storage with Supabase calls
  - [ ] Implement optimistic updates
  - [ ] Add sync status indicators
  - [ ] Handle offline mode gracefully
- [ ] Create data migration utility
  - [ ] Export existing local diagnoses
  - [ ] Batch upload to Supabase
  - [ ] Verify data integrity
  - [ ] Clean up local storage after migration
- [ ] Update UI components
  - [ ] History list view
  - [ ] Diagnosis detail view
  - [ ] Add sync status indicators
  - [ ] Add pull-to-refresh

#### Files to Modify:
- `contexts/DiagnosisContext.tsx`
- `services/supabase-diagnoses.ts` (new)
- `app/(tabs)/history.tsx`
- `components/diagnosis/DiagnosisCard.tsx`

### 2.3 Implement Sync Logic
**Priority:** Medium  
**Estimated Time:** 2-3 days

#### Tasks:
- [ ] Create sync service (`services/sync-service.ts`)
  - [ ] Detect online/offline status
  - [ ] Queue operations when offline
  - [ ] Sync queue when online
  - [ ] Handle sync conflicts
- [ ] Implement background sync
  - [ ] Sync on app foreground
  - [ ] Periodic sync (when online)
  - [ ] Manual sync trigger
- [ ] Add sync status UI
  - [ ] Sync indicator in header
  - [ ] Last synced timestamp
  - [ ] Sync error notifications
- [ ] Implement offline-first approach
  - [ ] Local cache with AsyncStorage
  - [ ] Optimistic UI updates
  - [ ] Conflict resolution strategy

### 2.4 Multi-Device Support
**Priority:** Medium  
**Estimated Time:** 2 days

#### Tasks:
- [ ] Implement real-time subscriptions
  - [ ] Listen to diagnosis changes
  - [ ] Update UI on remote changes
  - [ ] Handle concurrent edits
- [ ] Add device management
  - [ ] Track active devices
  - [ ] Show "synced from device X" indicators
- [ ] Test multi-device scenarios
  - [ ] Create diagnosis on device A
  - [ ] Verify appears on device B
  - [ ] Test concurrent edits
  - [ ] Test offline → online sync

### 2.5 Testing & Validation
**Priority:** High  
**Estimated Time:** 2 days

#### Test Cases:
- [ ] **Create Operations**
  - [ ] Save diagnosis while online
  - [ ] Save diagnosis while offline
  - [ ] Verify sync when back online
- [ ] **Read Operations**
  - [ ] Fetch diagnosis history
  - [ ] Pagination works correctly
  - [ ] Search/filter functionality
- [ ] **Update Operations**
  - [ ] Update diagnosis details
  - [ ] Verify changes sync across devices
- [ ] **Delete Operations**
  - [ ] Delete diagnosis
  - [ ] Verify deletion syncs
  - [ ] Soft delete vs hard delete
- [ ] **Sync Scenarios**
  - [ ] Offline queue processing
  - [ ] Conflict resolution
  - [ ] Network interruption recovery
- [ ] **Performance**
  - [ ] Large dataset handling (1000+ diagnoses)
  - [ ] Image loading performance
  - [ ] Query optimization

---

## 🖼️ **Phase 3: Supabase Storage for Images** - PLANNED (Week 3-4)
**Status:** 📋 **Planned**  
**Duration:** 1 week  
**Effort:** Medium

### 3.1 Storage Setup
**Priority:** High  
**Estimated Time:** 1 day

#### Tasks:
- [ ] Create storage buckets in Supabase
  - [ ] `diagnosis-images` bucket (private)
  - [ ] `profile-photos` bucket (public)
  - [ ] Configure bucket policies
  - [ ] Set file size limits (10MB max)
  - [ ] Set allowed file types (jpg, png, webp)
- [ ] Configure RLS policies for storage
  - [ ] Users can upload to own folder
  - [ ] Users can read own images
  - [ ] Users can delete own images
- [ ] Enable CDN for faster delivery

### 3.2 Image Upload Service
**Priority:** High  
**Estimated Time:** 2 days

#### Tasks:
- [ ] Create storage service (`services/supabase-storage.ts`)
  - [ ] `uploadDiagnosisImage(file, userId)` - Upload image
  - [ ] `getImageUrl(path)` - Get signed URL
  - [ ] `deleteImage(path)` - Delete image
  - [ ] `uploadProfilePhoto(file, userId)` - Upload profile pic
- [ ] Implement image optimization
  - [ ] Resize before upload (max 1920px)
  - [ ] Compress images (quality 80%)
  - [ ] Convert to WebP format
  - [ ] Generate thumbnails
- [ ] Add upload progress tracking
  - [ ] Progress bar UI
  - [ ] Cancel upload option
  - [ ] Retry failed uploads

### 3.3 Migrate Existing Images
**Priority:** Medium  
**Estimated Time:** 2 days

#### Tasks:
- [ ] Create migration script
  - [ ] Export local images from AsyncStorage
  - [ ] Upload to Supabase Storage
  - [ ] Update diagnosis records with new URLs
  - [ ] Verify all images migrated
  - [ ] Clean up local storage
- [ ] Update image handling in app
  - [ ] Replace local URIs with Supabase URLs
  - [ ] Implement caching strategy
  - [ ] Add image loading states
  - [ ] Handle broken image links

### 3.4 Profile Photo Management
**Priority:** Low  
**Estimated Time:** 1 day

#### Tasks:
- [ ] Update profile edit screen
  - [ ] Add photo picker
  - [ ] Upload to Supabase Storage
  - [ ] Update profile record
  - [ ] Show upload progress
- [ ] Implement avatar display
  - [ ] Show profile photo in header
  - [ ] Fallback to initials
  - [ ] Circular crop
  - [ ] Caching

### 3.5 Testing
**Priority:** High  
**Estimated Time:** 1 day

#### Test Cases:
- [ ] Upload diagnosis image
- [ ] View uploaded image
- [ ] Delete image
- [ ] Upload profile photo
- [ ] Large file handling (>5MB)
- [ ] Network interruption during upload
- [ ] Concurrent uploads
- [ ] CDN delivery speed

---

## ⚡ **Phase 4: Edge Functions** - PLANNED (Week 4-5)
**Status:** 📋 **Planned**  
**Duration:** 1 week  
**Effort:** Medium

### 4.1 Gemini AI Edge Function
**Priority:** High  
**Estimated Time:** 2 days

#### Tasks:
- [ ] Create Edge Function for AI diagnosis
  - [ ] Set up Deno function
  - [ ] Integrate Gemini API
  - [ ] Handle text-based diagnosis
  - [ ] Handle image-based diagnosis
  - [ ] Implement error handling
- [ ] Secure API key
  - [ ] Store Gemini key in Supabase secrets
  - [ ] Remove key from client-side `.env`
  - [ ] Update app to call Edge Function
- [ ] Add rate limiting
  - [ ] Limit requests per user
  - [ ] Implement cooldown periods
  - [ ] Track usage metrics

#### Edge Function Structure:
```typescript
// supabase/functions/diagnose/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { GoogleGenerativeAI } from '@google/generative-ai'

serve(async (req) => {
  const { type, input, imageBase64 } = await req.json()
  
  // Authenticate user
  const authHeader = req.headers.get('Authorization')
  // ... verify JWT
  
  // Call Gemini API
  const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY'))
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
  
  // Generate diagnosis
  const result = await model.generateContent(/* ... */)
  
  return new Response(JSON.stringify(result), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

### 4.2 Caching & Performance
**Priority:** Medium  
**Estimated Time:** 2 days

#### Tasks:
- [ ] Implement response caching
  - [ ] Cache common diagnoses
  - [ ] Set TTL (time-to-live)
  - [ ] Invalidate on updates
- [ ] Add request deduplication
  - [ ] Prevent duplicate API calls
  - [ ] Return cached results
- [ ] Monitor performance
  - [ ] Track function execution time
  - [ ] Log errors
  - [ ] Set up alerts

### 4.3 Additional Edge Functions (Optional)
**Priority:** Low  
**Estimated Time:** 2 days

#### Potential Functions:
- [ ] **Email notifications**
  - [ ] Diagnosis ready notification
  - [ ] Weekly summary email
- [ ] **Analytics**
  - [ ] Track diagnosis patterns
  - [ ] Generate insights
- [ ] **Scheduled tasks**
  - [ ] Clean up old data
  - [ ] Generate reports

### 4.4 Testing
**Priority:** High  
**Estimated Time:** 1 day

#### Test Cases:
- [ ] Call Edge Function from app
- [ ] Verify authentication
- [ ] Test rate limiting
- [ ] Test error handling
- [ ] Load testing (concurrent requests)
- [ ] Verify caching works
- [ ] Monitor costs

---

## 🧪 **Phase 5: Testing & Quality Assurance** - ONGOING
**Status:** 🔄 **Continuous**  
**Duration:** Throughout migration  
**Effort:** Medium

### 5.1 Unit Testing
- [ ] Write tests for Supabase services
- [ ] Test auth flows
- [ ] Test data operations
- [ ] Test sync logic
- [ ] Test error handling

### 5.2 Integration Testing
- [ ] Test end-to-end user flows
- [ ] Test multi-device sync
- [ ] Test offline scenarios
- [ ] Test data migration
- [ ] Test image uploads

### 5.3 Performance Testing
- [ ] Load testing (1000+ users)
- [ ] Stress testing (concurrent operations)
- [ ] Network condition testing (slow 3G, offline)
- [ ] Memory leak detection
- [ ] Battery usage optimization

### 5.4 Security Testing
- [ ] RLS policy verification
- [ ] Authentication bypass attempts
- [ ] SQL injection testing
- [ ] XSS vulnerability testing
- [ ] API key exposure checks

---

## 🚀 **Phase 6: Gradual Rollout** - FINAL (Week 5)
**Status:** 📋 **Planned**  
**Duration:** 3-5 days  
**Effort:** Medium

### 6.1 Beta Testing
**Priority:** High  
**Estimated Time:** 2 days

#### Tasks:
- [ ] Select beta testers (5-10 users)
- [ ] Provide beta build
- [ ] Collect feedback
- [ ] Monitor error logs
- [ ] Fix critical issues
- [ ] Iterate based on feedback

### 6.2 Staged Rollout
**Priority:** High  
**Estimated Time:** 3 days

#### Rollout Strategy:
- [ ] **Stage 1:** 10% of users (Day 1)
  - [ ] Monitor for issues
  - [ ] Check error rates
  - [ ] Verify sync working
- [ ] **Stage 2:** 25% of users (Day 2)
  - [ ] Continue monitoring
  - [ ] Address any issues
- [ ] **Stage 3:** 50% of users (Day 3)
  - [ ] Verify stability
  - [ ] Check performance metrics
- [ ] **Stage 4:** 100% of users (Day 4-5)
  - [ ] Full rollout
  - [ ] Monitor closely for 48 hours

### 6.3 Monitoring & Support
**Priority:** High  
**Estimated Time:** Ongoing

#### Tasks:
- [ ] Set up error tracking (Sentry)
- [ ] Monitor Supabase dashboard
  - [ ] Database performance
  - [ ] Storage usage
  - [ ] Function execution
  - [ ] API usage
- [ ] Create support documentation
- [ ] Prepare rollback plan
- [ ] Monitor user feedback

---

## 📈 Success Metrics

### Performance Metrics:
- ✅ Auth response time: < 2 seconds
- ⏳ Diagnosis save time: < 1 second (target)
- ⏳ Image upload time: < 5 seconds for 5MB (target)
- ⏳ Sync time: < 3 seconds for 100 items (target)

### Reliability Metrics:
- ✅ Auth success rate: 100%
- ⏳ Sync success rate: > 99% (target)
- ⏳ Uptime: > 99.9% (target)

### User Experience Metrics:
- ⏳ Offline functionality: Full CRUD operations
- ⏳ Multi-device sync: < 5 seconds
- ⏳ Error rate: < 1%

---

## 🎯 Current Status Summary

### ✅ Completed (Week 1):
- Supabase project setup
- Authentication system migration
- Database schema (profiles table)
- Documentation

### 🔜 Next Up (Week 2):
**Priority: Phase 2.1 - Database Schema Design**
1. Design diagnoses table schema
2. Create migration SQL scripts
3. Set up RLS policies
4. Document schema

**Estimated Start:** Ready to begin  
**Estimated Completion:** 2-3 days

### 📋 Upcoming (Week 2-3):
- Migrate diagnosis history
- Implement sync logic
- Multi-device support
- Testing

### 📋 Future (Week 3-5):
- Supabase Storage for images
- Edge Functions for Gemini AI
- Beta testing
- Gradual rollout

---

## 🚧 Blockers & Risks

### Current Blockers:
- None

### Potential Risks:
1. **Data Migration Complexity**
   - Risk: Data loss during migration
   - Mitigation: Backup before migration, verify data integrity
   
2. **Offline Sync Conflicts**
   - Risk: Data conflicts when syncing offline changes
   - Mitigation: Implement conflict resolution strategy
   
3. **API Rate Limits**
   - Risk: Hitting Supabase free tier limits
   - Mitigation: Monitor usage, optimize queries, consider paid plan
   
4. **Image Storage Costs**
   - Risk: Storage costs exceed budget
   - Mitigation: Implement image compression, set size limits

---

## 📞 Support & Resources

### Documentation:
- [Supabase Docs](https://supabase.com/docs)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)

### Project Files:
- `SUPABASE_SETUP.sql` - Database setup script
- `SUPABASE_MIGRATION_GUIDE.md` - Setup instructions
- `SUPABASE_FULL_MIGRATION_ROADMAP.md` - This document

---

**Last Updated:** Feb 28, 2026  
**Next Review:** Start of Phase 2 (Week 2)
