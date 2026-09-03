-- Run after creating the 'restaurant-photos' bucket (Dashboard → Storage → New bucket → Public)

create policy "restaurant_photos_public_read" on storage.objects
  for select using (bucket_id = 'restaurant-photos');

create policy "restaurant_photos_owner_insert" on storage.objects
  for insert with check (
    bucket_id = 'restaurant-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "restaurant_photos_owner_delete" on storage.objects
  for delete using (
    bucket_id = 'restaurant-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
