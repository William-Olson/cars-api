dev: start-containers
	@COMMENT='Installing Dependencies' make -s flower-box
	node -v
	npm install
	cp -r ./src/swagger ./build/
	@COMMENT='Running Dev Build' make -s flower-box
	DEBUG=app* NODE_ENV=development ES_URL=http://localhost:9200 npm run dev

start-containers: clean
	@COMMENT='Starting Docker Containers' make -s flower-box
	./scripts/start_dev_db.sh
	./scripts/start_elasticsearch.sh
	./scripts/start_kibana.sh

clean:
	@mkdir -p ./build
	rm -rf ./build
	mkdir -p ./build
	@COMMENT='Attempting to stop Docker Containers' make -s flower-box
	@docker kill mysql-db || echo 'kill db command failed, but thats okay'
	@docker kill elastic || echo 'kill elastic command failed, but thats okay'
	@docker kill kibana || echo 'kill kibana command failed, but thats okay'

flower-box:
	@echo
	@echo '#---------------------------------------------#'
	@echo '#      ${COMMENT}'
	@echo '#---------------------------------------------#'
	@echo
