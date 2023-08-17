import { createAPI } from 'koagger';

import { UserController } from './User';

export * from './User';

export const { swagger, mocker, router } = createAPI({
    mock: false,
    controllers: [UserController]
});
