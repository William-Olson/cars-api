dev: start-db
	@COMMENT='Installing Dependencies' make -s flower-box
	node -v
	npm install
	@COMMENT='Running Dev Build' make -s flower-box
	DEBUG=app* NODE_ENV=development npm run dev

start-db: clean
	@COMMENT='Starting MySQL via Docker' make -s flower-box
	./start_dev_db.sh

clean:
	@mkdir -p ./build
	rm -rf ./build
	mkdir -p ./build
	@COMMENT='Attempting to stop MySQL DB' make -s flower-box
	@docker kill mysql-db || echo 'kill command failed, but thats okay'

flower-box:
	@echo
	@echo '#---------------------------------------------#'
	@echo '#      ${COMMENT}'
	@echo '#---------------------------------------------#'
	@echo
