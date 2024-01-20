export default function redisCachingMiddleware(redisClient: { get: (arg0: string, arg1: (err: any, data: any) => any) => void; }, key: any) {
  // eslint-disable-next-line func-names
  return function (req: { params: { id: string; }; }, res: { json: (arg0: any) => any; }, next: () => any) {
    const params = req.params.id || '';
    redisClient.get(`${key}_${params}`, (err, data) => {
      if (err) {
        console.log(err);
      }
      if (data) {
        return res.json(JSON.parse(data));
      }
      return next();
    });
  };
}
