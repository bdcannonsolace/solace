CREATE INDEX "first_name_idx" ON "advocates" USING btree ("first_name");--> statement-breakpoint
CREATE INDEX "last_name_idx" ON "advocates" USING btree ("last_name");--> statement-breakpoint
CREATE INDEX "city_idx" ON "advocates" USING btree ("city");--> statement-breakpoint
CREATE INDEX "degree_idx" ON "advocates" USING btree ("degree");--> statement-breakpoint
CREATE INDEX "specialties_idx" ON "advocates" USING gin ("payload");--> statement-breakpoint
CREATE INDEX "years_of_experience_idx" ON "advocates" USING btree ("years_of_experience");--> statement-breakpoint
CREATE INDEX "phone_number_idx" ON "advocates" USING btree ("phone_number");