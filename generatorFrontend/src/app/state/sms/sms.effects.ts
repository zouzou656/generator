import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, of } from 'rxjs';
import { catchError, exhaustMap, map } from 'rxjs/operators';
import { SmsCampaignActions } from './sms-campaigns.actions';
import { API_CLIENT, ApiClient } from '../../core/api/api-client';

@Injectable()
export class SmsEffects {
  private readonly actions$ = inject(Actions);
  private readonly api = inject<ApiClient>(API_CLIENT);

  loadCampaigns$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SmsCampaignActions.loadCampaigns),
      exhaustMap((action) =>
        from(this.api.getSmsCampaigns(action.ownerId)).pipe(
          map((campaigns) => SmsCampaignActions.loadCampaignsSuccess({ campaigns })),
          catchError((error) => of(SmsCampaignActions.loadCampaignsFailure({ error })))
        )
      )
    )
  );

  upsertCampaign$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SmsCampaignActions.upsertCampaign),
      exhaustMap((action) =>
        from(this.api.upsertSmsCampaign(action.ownerId, action.payload)).pipe(
          map((campaign) => SmsCampaignActions.upsertCampaignSuccess({ campaign })),
          catchError((error) => of(SmsCampaignActions.loadCampaignsFailure({ error })))
        )
      )
    )
  );

  sendCampaign$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SmsCampaignActions.sendCampaign),
      exhaustMap((action) =>
        from(this.api.sendSmsCampaign(action.ownerId, action.campaignId)).pipe(
          map((campaign) => SmsCampaignActions.upsertCampaignSuccess({ campaign })),
          catchError((error) => of(SmsCampaignActions.loadCampaignsFailure({ error })))
        )
      )
    )
  );

  loadMessages$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SmsCampaignActions.loadCampaignMessages),
      exhaustMap((action) =>
        from(this.api.getSmsMessages(action.campaignId)).pipe(
          map((messages) => SmsCampaignActions.loadCampaignMessagesSuccess({ messages })),
          catchError((error) => of(SmsCampaignActions.loadCampaignMessagesFailure({ error })))
        )
      )
    )
  );
}





